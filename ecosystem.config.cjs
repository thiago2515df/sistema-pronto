module.exports = {
  apps: [{
    name: 'proposta-viagem-rio',
    script: './dist/index.js',
    cwd: '/home/ubuntu',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      DATABASE_URL: 'file:./data/proposta-viagem.db',
      JWT_SECRET: 'proposta-viagem-rio-secret-key-2024',
      OWNER_OPEN_ID: 'admin',
      OAUTH_SERVER_URL: 'https://api.manus.im',
      VITE_APP_ID: 'proposta-viagem-rio',
      VITE_APP_TITLE: 'Sistema de Propostas de Viagem',
      VITE_OAUTH_PORTAL_URL: 'https://api.manus.im'
    },
    error_file: '/home/ubuntu/logs/pm2-error.log',
    out_file: '/home/ubuntu/logs/pm2-out.log',
    log_file: '/home/ubuntu/logs/pm2-combined.log',
    time: true,
    merge_logs: true
  }]
};
