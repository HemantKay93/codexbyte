module.exports = {
  apps: [
    {
      name: "openwa-worker",
      script: "./dist/services/openwa-worker/index.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
      },
      // Oracle VPS environment variables should be set in .env or PM2 env
      // pm2 start ecosystem.config.cjs --env production
      error_file: "logs/worker-error.log",
      out_file: "logs/worker-out.log",
      merge_logs: true,
      time: true,
    }
  ]
};
