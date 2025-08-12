#!/usr/bin/env node

/**
 * Script de démonstration du système de vente de tickets
 * Ce script teste automatiquement toutes les fonctionnalités
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

// Couleurs pour la console
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, description) {
    log(`\n${colors.cyan}${colors.bright}ÉTAPE ${step}:${colors.reset} ${description}`);
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logInfo(message) {
    log(`ℹ️  ${message}`, 'blue');
}

async function testAPI() {
    log(`${colors.bright}${colors.magenta}🎫 DÉMONSTRATION DU SYSTÈME DE VENTE DE TICKETS${colors.reset}\n`);
    
    try {
        // ÉTAPE 1: Créer un événement
        logStep(1, 'Création d\'un événement de test');
        
        const eventData = {
            name: "Concert de Jazz en Plein Air",
            description: "Une soirée magique avec les meilleurs musiciens de jazz de la région",
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Dans 7 jours
            location: "Parc de la Liberté, Centre-ville",
            price: 45.00,
            max_tickets: 100
        };
        
        const createEventResponse = await fetch(`${BASE_URL}/api/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData)
        });
        
        if (!createEventResponse.ok) {
            throw new Error(`Erreur création événement: ${createEventResponse.status}`);
        }
        
        const createdEvent = await createEventResponse.json();
        logSuccess(`Événement créé avec l'ID: ${createdEvent.id}`);
        logInfo(`Nom: ${eventData.name}`);
        logInfo(`Prix: ${eventData.price}€`);
        logInfo(`Lieu: ${eventData.location}`);
        
        // ÉTAPE 2: Lister les événements
        logStep(2, 'Récupération de la liste des événements');
        
        const eventsResponse = await fetch(`${BASE_URL}/api/events`);
        if (!eventsResponse.ok) {
            throw new Error(`Erreur récupération événements: ${eventsResponse.status}`);
        }
        
        const events = await eventsResponse.json();
        logSuccess(`${events.length} événement(s) trouvé(s)`);
        events.forEach(event => {
            logInfo(`- ${event.name} (${event.price}€) - ${new Date(event.date).toLocaleDateString('fr-FR')}`);
        });
        
        // ÉTAPE 3: Acheter des tickets
        logStep(3, 'Achat de tickets pour différents clients');
        
        const customers = [
            { name: "Marie Dupont", email: "marie.dupont@email.com" },
            { name: "Jean Martin", email: "jean.martin@email.com" },
            { name: "Sophie Bernard", email: "sophie.bernard@email.com" }
        ];
        
        const tickets = [];
        
        for (let i = 0; i < customers.length; i++) {
            const customer = customers[i];
            logInfo(`Achat ticket pour ${customer.name}...`);
            
            const purchaseResponse = await fetch(`${BASE_URL}/api/tickets/purchase`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event_id: createdEvent.id,
                    customer_name: customer.name,
                    customer_email: customer.email
                })
            });
            
            if (!purchaseResponse.ok) {
                throw new Error(`Erreur achat ticket pour ${customer.name}: ${purchaseResponse.status}`);
            }
            
            const ticket = await purchaseResponse.json();
            tickets.push(ticket);
            logSuccess(`Ticket acheté pour ${customer.name} - Code: ${ticket.ticket_code.substring(0, 8)}...`);
        }
        
        // ÉTAPE 4: Connexion scanner
        logStep(4, 'Connexion en tant que scanner');
        
        const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'scanner',
                password: 'scanner123'
            })
        });
        
        if (!loginResponse.ok) {
            throw new Error(`Erreur connexion scanner: ${loginResponse.status}`);
        }
        
        const loginData = await loginResponse.json();
        logSuccess(`Scanner connecté: ${loginData.user.username}`);
        logInfo(`Token JWT reçu (${loginData.token.length} caractères)`);
        
        // ÉTAPE 5: Valider les tickets
        logStep(5, 'Validation des tickets achetés');
        
        for (let i = 0; i < tickets.length; i++) {
            const ticket = tickets[i];
            logInfo(`Validation du ticket de ${ticket.customer.name}...`);
            
            const validateResponse = await fetch(`${BASE_URL}/api/tickets/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ticket_code: ticket.ticket_code,
                    scanner_username: 'scanner'
                })
            });
            
            if (!validateResponse.ok) {
                const error = await validateResponse.json();
                logError(`Erreur validation ticket: ${error.error}`);
            } else {
                const validationResult = await validateResponse.json();
                logSuccess(`Ticket validé pour ${validationResult.ticket.customer_name}`);
                logInfo(`Scanné par: ${validationResult.ticket.scanned_by}`);
                logInfo(`Heure: ${new Date(validationResult.ticket.scanned_at).toLocaleTimeString('fr-FR')}`);
            }
        }
        
        // ÉTAPE 6: Vérifier les statistiques
        logStep(6, 'Récupération des statistiques de l\'événement');
        
        const statsResponse = await fetch(`${BASE_URL}/api/events/${createdEvent.id}/stats`);
        if (!statsResponse.ok) {
            throw new Error(`Erreur récupération stats: ${statsResponse.status}`);
        }
        
        const stats = await statsResponse.json();
        logSuccess('Statistiques récupérées:');
        logInfo(`Total tickets: ${stats.total_tickets}`);
        logInfo(`Tickets valides: ${stats.valid_tickets}`);
        logInfo(`Tickets scannés: ${stats.scanned_tickets}`);
        
        // ÉTAPE 7: Test de validation d'un ticket déjà scanné
        logStep(7, 'Test de validation d\'un ticket déjà scanné (défense anti-fraude)');
        
        if (tickets.length > 0) {
            const alreadyScannedTicket = tickets[0];
            logInfo(`Tentative de re-scan du ticket de ${alreadyScannedTicket.customer.name}...`);
            
            const duplicateScanResponse = await fetch(`${BASE_URL}/api/tickets/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ticket_code: alreadyScannedTicket.ticket_code,
                    scanner_username: 'scanner'
                })
            });
            
            if (duplicateScanResponse.ok) {
                logError('ERREUR: Le ticket a été validé deux fois !');
            } else {
                const error = await duplicateScanResponse.json();
                logSuccess(`Protection anti-fraude active: ${error.error}`);
                if (error.scanned_at) {
                    logInfo(`Ticket déjà scanné le: ${new Date(error.scanned_at).toLocaleString('fr-FR')}`);
                }
            }
        }
        
        // RÉSUMÉ FINAL
        log(`\n${colors.bright}${colors.green}🎉 DÉMONSTRATION TERMINÉE AVEC SUCCÈS !${colors.reset}`);
        log(`\n${colors.cyan}Résumé de la démonstration:${colors.reset}`);
        log(`• 1 événement créé`);
        log(`• ${tickets.length} tickets achetés`);
        log(`• ${tickets.length} tickets validés`);
        log(`• Système de scan fonctionnel`);
        log(`• Protection anti-fraude active`);
        log(`• Base de données opérationnelle`);
        
        log(`\n${colors.yellow}📱 Pour tester l'interface web:${colors.reset}`);
        log(`• Interface principale: ${BASE_URL}`);
        log(`• Scanner mobile: ${BASE_URL}/scanner.html`);
        
        log(`\n${colors.blue}🔑 Identifiants de test:${colors.reset}`);
        log(`• Scanner: scanner / scanner123`);
        
    } catch (error) {
        logError(`Erreur lors de la démonstration: ${error.message}`);
        process.exit(1);
    }
}

// Vérifier que le serveur est accessible
async function checkServer() {
    try {
        const response = await fetch(BASE_URL);
        if (response.ok) {
            return true;
        }
    } catch (error) {
        return false;
    }
    return false;
}

// Fonction principale
async function main() {
    log(`${colors.yellow}Vérification de la disponibilité du serveur...${colors.reset}`);
    
    if (await checkServer()) {
        logSuccess('Serveur accessible, lancement de la démonstration...');
        await testAPI();
    } else {
        logError(`Serveur non accessible sur ${BASE_URL}`);
        logInfo('Assurez-vous que le serveur est démarré avec: npm start');
        process.exit(1);
    }
}

// Lancer la démonstration
if (require.main === module) {
    main().catch(error => {
        logError(`Erreur fatale: ${error.message}`);
        process.exit(1);
    });
}

module.exports = { testAPI, checkServer };