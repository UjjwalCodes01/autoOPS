#!/bin/bash

# AutoOps Deployment Script
# Supports multiple deployment targets

set -e

echo "🚀 AutoOps Deployment Script"
echo "============================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."

    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi

    print_success "Dependencies check passed"
}

# Install dependencies
install_deps() {
    print_status "Installing dependencies..."
    npm ci
    print_success "Dependencies installed"
}

# Build the application
build_app() {
    print_status "Building application..."
    # Motia doesn't require a build step for basic deployment
    print_success "Application ready for deployment"
}

# Deploy to different targets
deploy_local() {
    print_status "Deploying to local production..."
    export NODE_ENV=production
    export PORT=3000
    npm run dev &
    echo $! > .pid
    print_success "Application deployed locally on port 3000"
    print_status "PID saved to .pid file"
}

deploy_docker() {
    print_error "Docker deployment has been removed. Use 'render', 'railway', or 'fly' instead."
    exit 1
}

deploy_railway() {
    print_status "Preparing for Railway deployment..."

    # Create railway.json if it doesn't exist
    if [ ! -f "railway.json" ]; then
        cat > railway.json << EOF
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run dev"
  }
}
EOF
        print_success "Created railway.json"
    fi

    print_status "To deploy to Railway:"
    print_status "1. Install Railway CLI: npm install -g @railway/cli"
    print_status "2. Login: railway login"
    print_status "3. Initialize: railway init"
    print_status "4. Deploy: railway up"
}

deploy_render() {
    print_status "Preparing for Render deployment..."

    # Create render.yaml if it doesn't exist
    if [ ! -f "render.yaml" ]; then
        cat > render.yaml << EOF
services:
  - type: web
    name: autoops
    runtime: node
    buildCommand: npm ci
    startCommand: npm run dev
    envVars:
      - key: NODE_ENV
        value: production
      - key: GOOGLE_AI_API_KEY
        sync: false
EOF
        print_success "Created render.yaml"
    fi

    print_status "To deploy to Render:"
    print_status "1. Connect your GitHub repository to Render"
    print_status "2. Create a new Web Service"
    print_status "3. Use the render.yaml file for configuration"
}

deploy_fly() {
    print_status "Preparing for Fly.io deployment..."

    # Create fly.toml if it doesn't exist
    if [ ! -f "fly.toml" ]; then
        cat > fly.toml << EOF
app = "autoops"

[build]
  builder = "paketobuildpacks/builder:base"
  buildpacks = ["gcr.io/paketo-buildpacks/nodejs"]

[env]
  NODE_ENV = "production"

[[services]]
  internal_port = 3000
  protocol = "tcp"

  [services.concurrency]
    hard_limit = 25
    soft_limit = 20

  [[services.ports]]
    handlers = ["http"]
    port = "80"

  [[services.ports]]
    handlers = ["tls", "http"]
    port = "443"

  [[services.tcp_checks]]
    interval = "10s"
    timeout = "2s"
    port = "3000"
EOF
        print_success "Created fly.toml"
    fi

    print_status "To deploy to Fly.io:"
    print_status "1. Install Fly CLI: curl -L https://fly.io/install.sh | sh"
    print_status "2. Login: fly auth login"
    print_status "3. Launch: fly launch"
}

# Main deployment logic
main() {
    TARGET=${1:-"local"}

    check_dependencies
    install_deps
    build_app

    case $TARGET in
        "local")
            deploy_local
            ;;
        "railway")
            deploy_railway
            ;;
        "render")
            deploy_render
            ;;
        "fly")
            deploy_fly
            ;;
        *)
            print_error "Unknown deployment target: $TARGET"
            echo "Available targets: local, railway, render, fly"
            exit 1
            ;;
    esac

    print_success "Deployment completed!"
    print_status "Your AutoOps system is now running!"
    print_status "Test with: curl http://localhost:3000/incident"
}

# Show usage if no arguments
if [ $# -eq 0 ]; then
    echo "Usage: $0 [target]"
    echo ""
    echo "Targets:"
    echo "  local    - Deploy locally (default)"
    echo "  railway  - Prepare for Railway deployment"
    echo "  render   - Prepare for Render deployment"
    echo "  fly      - Prepare for Fly.io deployment"
    echo ""
    echo "Examples:"
    echo "  $0 local"
    echo "  $0 docker"
    exit 1
fi

main "$@"