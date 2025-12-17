# Standup Script - Quick Start Guide

## 🚀 One-Command Deployment

This script automates the entire deployment process for Security RAT Modern.

### Usage

```bash
# From project root directory
./standup.sh
```

### What It Does

1. **Checks Prerequisites**
   - Verifies Docker is running
   - Verifies Docker Compose is installed

2. **Cleans Up**
   - Removes previous containers and volumes
   - Prepares for fresh deployment

3. **Builds Docker Images**
   - Builds backend image
   - Builds frontend image

4. **Starts All Services**
   - PostgreSQL database
   - Redis caching
   - Backend API
   - Frontend web interface

5. **Verifies Services**
   - Checks PostgreSQL readiness
   - Checks Backend API health
   - Checks Frontend availability

6. **Displays Access Information**
   - Frontend: http://localhost:1234
   - Backend API: http://localhost:3000
   - PostgreSQL: localhost:5432
   - Redis: localhost:6379

## 📋 Features

### Color-Coded Output
- ✅ Green - Success messages
- ⚠️ Yellow - Warnings
- ❌ Red - Errors
- 📋 Blue - Information

### Automatic Checks
- Docker availability
- Docker Compose availability
- Service readiness verification

### Smart Waiting
- Waits for services to start
- Checks service health
- Provides feedback on progress

## 🎯 Access Information

After running the script, you can access:

- **Frontend**: http://localhost:1234
- **Backend API**: http://localhost:3000
- **PostgreSQL**: localhost:5432 (user: securityrat, password: securityrat)
- **Redis**: localhost:6379

## 🔧 Troubleshooting

### View Logs
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
```

### Clean Build
```bash
# Stop everything and clean up
./standup.sh  # This will clean up automatically

# Or manually
docker-compose down -v
rm -rf apps/backend/data
```

### Common Issues

**Docker not running**:
- Start Docker Desktop
- Run `docker system prune` to clean up

**Port conflicts**:
- Change ports in docker-compose.yml
- Stop conflicting services

**Build failures**:
- Run `npm install` first
- Check node_modules are present

## 📚 Documentation

For more details, see:
- `DOCKER_README.md` - Comprehensive Docker guide
- `QUICK_START.md` - Quick start guide
- `DOCKER_SETUP_SUMMARY.md` - Setup summary

## 🎉 Enjoy!

The standup script makes it easy to deploy Security RAT Modern with just one command. Sit back and relax while the script handles everything for you! 🎊
