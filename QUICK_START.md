# Quick Start Guide

## 🚀 Deploy Security RAT Modern with Docker

### 1. Prerequisites
- Docker installed (Docker Desktop recommended)
- Docker Compose
- At least 4GB RAM allocated to Docker

### 2. Build and Start
```bash
# From project root
docker-compose up --build
```

### 3. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### 4. Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (use with caution)
docker-compose down -v
```

## 📋 Configuration

### Environment Variables
Create `.env` file in project root:
```bash
JWT_SECRET=your-secret-key-here
```

### Custom Ports
Edit `docker-compose.yml` to change ports.

## 📚 Documentation

- **DOCKER_README.md** - Comprehensive Docker guide
- **DOCKER_SETUP_SUMMARY.md** - Quick reference
- **FINAL_COMPREHENSIVE_SUMMARY.md** - Complete project overview

## 🔧 Troubleshooting

### Port Conflicts
```bash
# Check what's using the port
lsof -i :5173
lsof -i :3000
```

### Logs
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend

# Follow logs in real-time
docker-compose logs -f
```

### Clean Build
```bash
# Remove all containers and volumes
docker-compose down -v

# Rebuild from scratch
docker-compose up --build
```

## 📞 Support

For issues or questions, refer to the documentation files in the `/docs` directory.

## ✅ Next Steps

1. ✅ Docker setup complete
2. ✅ Application running
3. ✅ Access via browser
4. ✅ Enjoy Security RAT Modern!

