#!/bin/bash

# Production start script for AutoOps
# This script ensures the application starts properly in production

set -e

echo "🚀 Starting AutoOps in Production Mode"

# Set production environment
export NODE_ENV=production
export PORT=${PORT:-3000}

# Ensure we're in the correct directory
cd "$(dirname "$0")"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm ci --only=production
fi

# Wait for dependencies (like Redis) if needed
echo "⏳ Waiting for services to be ready..."
sleep 2

# Start the application
echo "🎯 Starting Motia server on port $PORT..."
exec npx motia dev