#!/bin/bash
echo "Deploying OpenWA Worker on Oracle VPS..."

# Ensure we are in the project root
cd "$(dirname "$0")/../.." || exit

# Pull latest code
git pull origin master

# Install only backend dependencies
cd backend || exit
npm ci

# Build the TypeScript worker code
npm run build

# Restart or Start the worker with PM2
echo "Restarting PM2 worker..."
npm run start:worker

echo "Deployment complete! Worker is now running in the background."
echo "Use 'pm2 logs openwa-worker' to view output."
