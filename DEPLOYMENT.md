# 🚀 AutoOps Deployment Guide

## Overview

Your AutoOps incident response system can be deployed to various platforms. This guide covers all deployment options from simple local deployment to cloud platforms.

## Quick Start

### Option 1: Motia Cloud (Easiest)
```bash
# Install Motia CLI
npm install -g @motia/cli

# Deploy to Motia Cloud
motia deploy
```

### Option 2: Local Production
```bash
# Quick deploy script
npm run deploy:local
```

### Option 3: Docker
```bash
# Deploy with Docker
npm run deploy:docker
```

## Detailed Deployment Options

### 1. Local Deployment

#### Development
```bash
npm run dev
```

#### Production
```bash
npm run start:prod
```

#### Background Process
```bash
npm run deploy:local
# Creates .pid file for process management
```

### 2. Docker Deployment

#### Using Docker Compose (Recommended)
```bash
# Build and run
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

#### Manual Docker
```bash
# Build image
docker build -t autoops .

# Run container
docker run -p 3000:3000 -e NODE_ENV=production autoops
```

### 3. Cloud Platform Deployments

#### Railway
```bash
# Prepare deployment
npm run deploy:railway

# Deploy
railway login
railway init
railway up
```

#### Render
```bash
# Prepare deployment
npm run deploy:render

# Then connect GitHub repo to Render Web Service
```

#### Fly.io
```bash
# Prepare deployment
npm run deploy:fly

# Deploy
fly launch
```

#### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Heroku
```bash
# Create Procfile
echo "web: npm run dev" > Procfile

# Deploy
git push heroku main
```

### 4. Kubernetes Deployment

#### Using kubectl
```yaml
# Save this as k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: autoops
spec:
  replicas: 2
  selector:
    matchLabels:
      app: autoops
  template:
    metadata:
      labels:
        app: autoops
    spec:
      containers:
      - name: autoops
        image: your-registry/autoops:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
---
apiVersion: v1
kind: Service
metadata:
  name: autoops-service
spec:
  selector:
    app: autoops
  ports:
    - port: 3000
  type: LoadBalancer
```

```bash
# Deploy to Kubernetes
kubectl apply -f k8s-deployment.yaml
```

## Environment Configuration

### Required Environment Variables
```bash
# Production mode
NODE_ENV=production

# Port (optional, defaults to 3000)
PORT=3000

# Google AI API Key (optional)
GOOGLE_AI_API_KEY=your_key_here
```

### Redis Configuration
If using external Redis:
```bash
REDIS_URL=redis://your-redis-host:6379
```

## Health Checks & Monitoring

### Health Check Endpoint
```bash
curl http://your-domain.com/health
```

### Monitoring Logs
```bash
# Docker logs
docker-compose logs -f autoops

# Local logs (when running in background)
tail -f logs/*.log
```

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

#### Redis Connection Issues
```bash
# Check Redis status (if using Docker)
docker-compose ps redis

# Restart Redis
docker-compose restart redis
```

#### Memory Issues
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run start:prod
```

#### Build Failures
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Performance Tuning

### Environment Variables for Production
```bash
# Memory optimization
NODE_OPTIONS="--max-old-space-size=2048"

# Clustering (if needed)
NODE_ENV=production

# Redis connection pool
REDIS_MAX_CONNECTIONS=10
```

### Scaling Considerations
- **Horizontal Scaling**: Deploy multiple instances behind a load balancer
- **Redis Clustering**: Use Redis Cluster for high availability
- **Database**: Add PostgreSQL/MySQL for persistent incident storage

## Security Considerations

### Environment Variables
- Never commit secrets to version control
- Use platform-specific secret management (Railway secrets, Render env vars)
- Rotate API keys regularly

### Network Security
- Use HTTPS in production
- Configure firewalls appropriately
- Use internal networking for microservices

### Monitoring & Alerts
- Set up error tracking (Sentry, Bugsnag)
- Configure uptime monitoring
- Set up incident alerts

## Backup & Recovery

### Data Backup
```bash
# Backup Redis data (if using Docker)
docker exec autoops_redis_1 redis-cli SAVE

# Copy backup
docker cp autoops_redis_1:/data/dump.rdb ./backup/
```

### Application Logs
```bash
# Collect logs for analysis
docker-compose logs autoops > logs_$(date +%Y%m%d).log
```

## Support

For deployment issues:
1. Check the logs: `docker-compose logs -f`
2. Verify environment variables
3. Test locally first: `npm run dev`
4. Check Motia documentation: https://motia.dev

## Success Checklist

- [ ] Application starts without errors
- [ ] Health check returns 200: `curl http://localhost:3000/health`
- [ ] API endpoint works: `curl -X POST http://localhost:3000/incident -H "Content-Type: application/json" -d '{"service":"test","error":"test","severity":"low"}'`
- [ ] Logs show proper processing
- [ ] No Redis connection errors
- [ ] Memory usage is stable
- [ ] Response times are acceptable (< 2s for API calls)