module.exports = {
  apps: [{
    name: 'ticket-system',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3000,
      JWT_SECRET: 'votre_secret_jwt_super_securise'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      JWT_SECRET: process.env.JWT_SECRET || 'votre_secret_jwt_production_super_securise'
    },
    env_staging: {
      NODE_ENV: 'staging',
      PORT: 3000,
      JWT_SECRET: process.env.JWT_SECRET || 'votre_secret_jwt_staging'
    },
    // Configuration de performance
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    
    // Logs
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Monitoring
    pmx: true,
    monitor: true,
    
    // Restart automatique
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'tickets.db'],
    
    // Gestion des erreurs
    max_restarts: 10,
    min_uptime: '10s',
    
    // Variables d'environnement spécifiques
    env_file: '.env',
    
    // Scripts de cycle de vie
    pre_start: 'npm run build',
    post_start: 'echo "Application démarrée avec succès"',
    pre_stop: 'echo "Arrêt de l\'application..."',
    post_stop: 'echo "Application arrêtée"',
    
    // Configuration de cluster
    kill_timeout: 5000,
    listen_timeout: 3000,
    
    // Health check
    health_check_grace_period: 3000,
    health_check_fatal_exceptions: true
  }],
  
  // Configuration de déploiement
  deploy: {
    production: {
      user: 'ubuntu',
      host: 'votre-serveur.com',
      ref: 'origin/main',
      repo: 'git@github.com:votre-username/ticket-vending-system.git',
      path: '/var/www/ticket-system',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    },
    staging: {
      user: 'ubuntu',
      host: 'staging.votre-serveur.com',
      ref: 'origin/develop',
      repo: 'git@github.com:votre-username/ticket-vending-system.git',
      path: '/var/www/ticket-system-staging',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env staging',
      'pre-setup': ''
    }
  }
};