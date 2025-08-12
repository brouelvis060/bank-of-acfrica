#!/bin/bash

# Script de déploiement du système de vente de tickets
# Usage: ./deploy.sh [production|staging|local]

set -e

# Couleurs pour la console
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-local}
PROJECT_NAME="ticket-vending-system"
DOCKER_IMAGE="ticket-system:latest"

# Fonctions utilitaires
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérification des prérequis
check_prerequisites() {
    log "Vérification des prérequis..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker n'est pas installé"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose n'est pas installé"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        error "Node.js n'est pas installé"
        exit 1
    fi
    
    success "Tous les prérequis sont satisfaits"
}

# Déploiement local
deploy_local() {
    log "Déploiement local..."
    
    # Arrêter les services existants
    docker-compose down 2>/dev/null || true
    
    # Installer les dépendances
    log "Installation des dépendances..."
    npm install
    
    # Démarrer l'application
    log "Démarrage de l'application..."
    npm start &
    
    # Attendre que l'application soit prête
    log "Attente du démarrage de l'application..."
    sleep 10
    
    # Vérifier que l'application fonctionne
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        success "Application démarrée avec succès sur http://localhost:3000"
    else
        error "L'application n'a pas démarré correctement"
        exit 1
    fi
}

# Déploiement avec Docker
deploy_docker() {
    log "Déploiement avec Docker..."
    
    # Construire l'image
    log "Construction de l'image Docker..."
    docker build -t $DOCKER_IMAGE .
    
    # Arrêter les services existants
    log "Arrêt des services existants..."
    docker-compose down
    
    # Démarrer les services
    log "Démarrage des services..."
    docker-compose up -d
    
    # Attendre que les services soient prêts
    log "Attente du démarrage des services..."
    sleep 15
    
    # Vérifier la santé des services
    log "Vérification de la santé des services..."
    
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        success "Application accessible sur http://localhost:3000"
    else
        error "L'application n'est pas accessible"
        exit 1
    fi
    
    if curl -f http://localhost/health > /dev/null 2>&1; then
        success "Nginx accessible sur http://localhost"
    else
        error "Nginx n'est pas accessible"
        exit 1
    fi
}

# Déploiement en production
deploy_production() {
    log "Déploiement en production..."
    
    # Vérifier les variables d'environnement
    if [ -z "$JWT_SECRET" ]; then
        error "JWT_SECRET n'est pas défini"
        exit 1
    fi
    
    # Créer le fichier .env
    log "Création du fichier .env..."
    cat > .env << EOF
NODE_ENV=production
JWT_SECRET=$JWT_SECRET
PORT=3000
EOF
    
    # Déploiement Docker
    deploy_docker
    
    # Configuration SSL (optionnel)
    if [ "$ENABLE_SSL" = "true" ]; then
        log "Configuration SSL..."
        warning "N'oubliez pas de configurer vos certificats SSL dans le dossier ssl/"
        warning "Et de décommenter la configuration HTTPS dans nginx.conf"
    fi
    
    success "Déploiement en production terminé"
}

# Test de l'application
test_application() {
    log "Test de l'application..."
    
    # Test de l'API
    if curl -f http://localhost:3000/api/events > /dev/null 2>&1; then
        success "API accessible"
    else
        error "API non accessible"
        return 1
    fi
    
    # Test de création d'événement
    EVENT_RESPONSE=$(curl -s -X POST http://localhost:3000/api/events \
        -H "Content-Type: application/json" \
        -d '{"name":"Test Event","description":"Test","date":"2025-12-31T20:00:00","price":10.00}')
    
    if echo "$EVENT_RESPONSE" | grep -q "Événement créé avec succès"; then
        success "Création d'événement fonctionnelle"
    else
        error "Création d'événement échouée"
        return 1
    fi
    
    success "Tous les tests sont passés"
}

# Affichage des informations
show_info() {
    log "Informations du déploiement:"
    echo "  - Environnement: $ENVIRONMENT"
    echo "  - Application: http://localhost:3000"
    echo "  - Scanner mobile: http://localhost:3000/scanner.html"
    echo "  - Nginx: http://localhost"
    echo "  - Identifiants scanner: scanner / scanner123"
}

# Nettoyage
cleanup() {
    log "Nettoyage..."
    docker-compose down 2>/dev/null || true
    docker system prune -f 2>/dev/null || true
    success "Nettoyage terminé"
}

# Menu principal
main() {
    echo -e "${BLUE}🎫 Script de déploiement du système de vente de tickets${NC}"
    echo "=================================================="
    
    check_prerequisites
    
    case $ENVIRONMENT in
        "local")
            deploy_local
            ;;
        "docker")
            deploy_docker
            ;;
        "production")
            deploy_production
            ;;
        "staging")
            ENVIRONMENT="staging"
            deploy_docker
            ;;
        *)
            error "Environnement non reconnu: $ENVIRONMENT"
            echo "Usage: $0 [local|docker|staging|production]"
            exit 1
            ;;
    esac
    
    # Test de l'application
    if test_application; then
        show_info
        success "Déploiement terminé avec succès !"
    else
        error "Tests échoués"
        exit 1
    fi
}

# Gestion des signaux
trap cleanup EXIT
trap 'error "Déploiement interrompu"; exit 1' INT TERM

# Exécution
main "$@"