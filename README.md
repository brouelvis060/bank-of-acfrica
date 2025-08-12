# 🎫 Système de Vente de Tickets en Ligne

Un système complet de vente de tickets en ligne avec génération de QR codes et système de scan pour les événements.

## 🚀 Fonctionnalités

### Pour les organisateurs d'événements
- ✅ Création et gestion d'événements
- ✅ Définition des prix et limites de tickets
- ✅ Suivi des ventes en temps réel
- ✅ Statistiques détaillées

### Pour les clients
- ✅ Achat de tickets en ligne
- ✅ Génération automatique de QR codes
- ✅ Tickets envoyés par email (QR code)
- ✅ Interface responsive et moderne

### Pour les scanners
- ✅ Application mobile optimisée
- ✅ Scan de QR codes avec la caméra
- ✅ Saisie manuelle de codes
- ✅ Validation en temps réel
- ✅ Statistiques de scan

## 🏗️ Architecture technique

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Interface    │    │   Serveur       │    │   Base de       │
│   Web          │◄──►│   Express.js    │◄──►│   données       │
│   (Vente)      │    │   (API REST)    │    │   SQLite        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Scanner      │    │   Génération    │    │   Validation    │
│   Mobile       │    │   QR Codes      │    │   Tickets       │
│   (HTML5)      │    │   (UUID + QR)   │    │   (JWT)         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Technologies utilisées

- **Backend**: Node.js + Express.js
- **Base de données**: SQLite
- **Frontend**: HTML5 + CSS3 + JavaScript vanilla
- **QR Codes**: Bibliothèque `qrcode`
- **Authentification**: JWT + bcrypt
- **Scanner**: HTML5 QR Code Scanner

## 📦 Installation

### Prérequis
- Node.js (version 14 ou supérieure)
- npm ou yarn

### Étapes d'installation

1. **Cloner le projet**
```bash
git clone <votre-repo>
cd ticket-vending-system
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Démarrer le serveur**
```bash
npm start
```

4. **Accéder à l'application**
- Interface web : http://localhost:3000
- Scanner mobile : http://localhost:3000/scanner.html

## 🔧 Configuration

### Variables d'environnement
Créez un fichier `.env` à la racine du projet :

```env
PORT=3000
JWT_SECRET=votre_secret_jwt_super_securise
```

### Base de données
La base de données SQLite est créée automatiquement au premier démarrage dans le fichier `tickets.db`.

## 📱 Utilisation

### 1. Créer un événement
1. Allez sur l'onglet "Créer un événement"
2. Remplissez les informations :
   - Nom de l'événement
   - Description
   - Date et heure
   - Lieu
   - Prix du ticket
   - Nombre maximum de tickets (optionnel)
3. Cliquez sur "Créer l'événement"

### 2. Vendre des tickets
1. Les clients voient les événements disponibles
2. Ils remplissent leurs informations (nom, email)
3. Après achat, un QR code unique est généré
4. Le ticket est stocké en base avec le statut "valid"

### 3. Scanner les tickets
1. Ouvrez l'interface scanner sur mobile
2. Connectez-vous avec les identifiants scanner
3. Scannez le QR code ou saisissez le code manuellement
4. Le ticket est validé et marqué comme "scanned"

## 🔐 Sécurité

### Authentification
- **Utilisateur scanner par défaut** : `scanner` / `scanner123`
- **JWT** avec expiration de 24h
- **Mots de passe** hashés avec bcrypt

### Validation des tickets
- **Codes uniques** générés avec UUID v4
- **Statuts** : valid, scanned, invalid
- **Traçabilité** : qui a scanné, quand, pour quel événement

### Protection contre la fraude
- **Vérification** du statut avant validation
- **Limitation** du nombre de tickets par événement
- **Historique** complet des scans

## 📊 API REST

### Événements
- `POST /api/events` - Créer un événement
- `GET /api/events` - Lister les événements
- `GET /api/events/:id/stats` - Statistiques d'un événement

### Tickets
- `POST /api/tickets/purchase` - Acheter un ticket
- `POST /api/tickets/validate` - Valider un ticket

### Authentification
- `POST /api/auth/login` - Connexion scanner

## 🚀 Déploiement

### Production
1. **Variables d'environnement**
```bash
export NODE_ENV=production
export JWT_SECRET=votre_secret_production
export PORT=80
```

2. **Process Manager (PM2)**
```bash
npm install -g pm2
pm2 start server.js --name "ticket-system"
pm2 startup
pm2 save
```

3. **Reverse Proxy (Nginx)**
```nginx
server {
    listen 80;
    server_name votre-domaine.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Docker
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📱 Application mobile

### Scanner QR Code
- **Interface optimisée** pour mobile
- **Scan automatique** avec la caméra
- **Saisie manuelle** en cas de problème
- **Statistiques en temps réel**

### Fonctionnalités
- Connexion sécurisée
- Scan de QR codes
- Validation instantanée
- Historique des scans
- Statistiques par événement

## 🔍 Dépannage

### Problèmes courants

1. **Port déjà utilisé**
```bash
lsof -i :3000
kill -9 <PID>
```

2. **Base de données corrompue**
```bash
rm tickets.db
npm start
```

3. **Scanner QR ne fonctionne pas**
- Vérifiez les permissions caméra
- Utilisez HTTPS en production
- Testez sur différents navigateurs

### Logs
Les logs sont affichés dans la console. En production, utilisez un système de logging comme Winston.

## 📈 Améliorations futures

- [ ] Paiement en ligne (Stripe, PayPal)
- [ ] Notifications email/SMS
- [ ] Application mobile native
- [ ] Gestion des remboursements
- [ ] API pour intégration tierce
- [ ] Tableau de bord administrateur
- [ ] Export des données
- [ ] Gestion des places assises
- [ ] Codes promo et réductions

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Consultez la documentation de l'API
- Vérifiez les logs du serveur

---

**Développé avec ❤️ pour simplifier la gestion d'événements**
