const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt_super_securise';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Base de données SQLite
const db = new sqlite3.Database('tickets.db');

// Initialisation de la base de données
db.serialize(() => {
  // Table des événements
  db.run(`CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    location TEXT,
    price REAL NOT NULL,
    max_tickets INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Table des tickets
  db.run(`CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_code TEXT UNIQUE NOT NULL,
    event_id INTEGER NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    status TEXT DEFAULT 'valid',
    purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    scanned_at DATETIME,
    scanned_by TEXT,
    FOREIGN KEY (event_id) REFERENCES events (id)
  )`);

  // Table des utilisateurs (pour les scanners)
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'scanner',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Créer un utilisateur scanner par défaut
  const defaultPassword = 'scanner123';
  bcrypt.hash(defaultPassword, 10, (err, hash) => {
    if (!err) {
      db.run(`INSERT OR IGNORE INTO users (username, password_hash, role) VALUES (?, ?, ?)`, 
        ['scanner', hash, 'scanner']);
    }
  });
});

// Routes API

// 1. Créer un événement
app.post('/api/events', (req, res) => {
  const { name, description, date, location, price, max_tickets } = req.body;
  
  db.run(`INSERT INTO events (name, description, date, location, price, max_tickets) 
          VALUES (?, ?, ?, ?, ?, ?)`, 
    [name, description, date, location, price, max_tickets],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ 
        id: this.lastID, 
        message: 'Événement créé avec succès' 
      });
    });
});

// 2. Lister les événements
app.get('/api/events', (req, res) => {
  db.all(`SELECT * FROM events ORDER BY date DESC`, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// 3. Acheter un ticket
app.post('/api/tickets/purchase', (req, res) => {
  const { event_id, customer_name, customer_email } = req.body;
  
  // Vérifier que l'événement existe
  db.get(`SELECT * FROM events WHERE id = ?`, [event_id], (err, event) => {
    if (err || !event) {
      res.status(404).json({ error: 'Événement non trouvé' });
      return;
    }

    // Vérifier le nombre de tickets disponibles
    db.get(`SELECT COUNT(*) as count FROM tickets WHERE event_id = ? AND status = 'valid'`, 
      [event_id], (err, result) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }

        if (event.max_tickets && result.count >= event.max_tickets) {
          res.status(400).json({ error: 'Plus de tickets disponibles' });
          return;
        }

        // Générer un code unique pour le ticket
        const ticketCode = uuidv4();
        
        // Créer le ticket
        db.run(`INSERT INTO tickets (ticket_code, event_id, customer_name, customer_email) 
                VALUES (?, ?, ?, ?)`, 
          [ticketCode, event_id, customer_name, customer_email],
          function(err) {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }

            // Générer le QR code
            const ticketData = {
              ticket_id: this.lastID,
              ticket_code: ticketCode,
              event_name: event.name,
              customer_name: customer_name,
              event_date: event.date
            };

            QRCode.toDataURL(JSON.stringify(ticketData), (err, qrCodeDataUrl) => {
              if (err) {
                res.status(500).json({ error: 'Erreur lors de la génération du QR code' });
                return;
              }

              res.json({
                ticket_id: this.lastID,
                ticket_code: ticketCode,
                qr_code: qrCodeDataUrl,
                event: event,
                customer: { name: customer_name, email: customer_email },
                message: 'Ticket acheté avec succès'
              });
            });
          });
      });
  });
});

// 4. Valider un ticket (scan)
app.post('/api/tickets/validate', (req, res) => {
  const { ticket_code, scanner_username } = req.body;
  
  // Vérifier le ticket
  db.get(`SELECT t.*, e.name as event_name, e.date as event_date 
          FROM tickets t 
          JOIN events e ON t.event_id = e.id 
          WHERE t.ticket_code = ?`, 
    [ticket_code], (err, ticket) => {
      if (err || !ticket) {
        res.status(404).json({ error: 'Ticket non trouvé' });
        return;
      }

      if (ticket.status !== 'valid') {
        res.status(400).json({ 
          error: 'Ticket invalide', 
          status: ticket.status,
          scanned_at: ticket.scanned_at 
        });
        return;
      }

      // Marquer le ticket comme scanné
      const now = new Date().toISOString();
      db.run(`UPDATE tickets SET status = 'scanned', scanned_at = ?, scanned_by = ? 
              WHERE ticket_code = ?`, 
        [now, scanner_username, ticket_code],
        function(err) {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }

          res.json({
            success: true,
            message: 'Ticket validé avec succès',
            ticket: {
              id: ticket.id,
              event_name: ticket.event_name,
              event_date: ticket.event_date,
              customer_name: ticket.customer_name,
              scanned_at: now,
              scanned_by: scanner_username
            }
          });
        });
    });
});

// 5. Connexion pour les scanners
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
    if (err || !user) {
      res.status(401).json({ error: 'Identifiants invalides' });
      return;
    }

    bcrypt.compare(password, user.password_hash, (err, isMatch) => {
      if (err || !isMatch) {
        res.status(401).json({ error: 'Identifiants invalides' });
        return;
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      });
    });
  });
});

// 6. Obtenir les statistiques d'un événement
app.get('/api/events/:id/stats', (req, res) => {
  const eventId = req.params.id;
  
  db.get(`SELECT 
            COUNT(*) as total_tickets,
            SUM(CASE WHEN status = 'valid' THEN 1 ELSE 0 END) as valid_tickets,
            SUM(CASE WHEN status = 'scanned' THEN 1 ELSE 0 END) as scanned_tickets
          FROM tickets WHERE event_id = ?`, 
    [eventId], (err, stats) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(stats);
    });
});

// Route pour servir l'interface web
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📱 Interface web: http://localhost:${PORT}`);
  console.log(`🔑 Scanner par défaut: scanner / scanner123`);
});