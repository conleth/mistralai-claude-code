# Docker Setup for Security RAT Modern

This document provides instructions for running Security RAT Modern using Docker containers.

## Prerequisites

- Docker installed (Docker Desktop recommended)
- Docker Compose
- At least 4GB RAM allocated to Docker

## Quick Start

### 1. Build and Start All Services

```bash
# From the project root directory
docker-compose up --build
```

This will:
1. Build the backend and frontend images
2. Start PostgreSQL database
3. Start Redis (for caching)
4. Start the backend API service
5. Start the frontend web service

### 2. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **PostgreSQL**: localhost:5432 (user: securityrat, password: securityrat)
- **Redis**: localhost:6379

## Development Mode

For development, you can run services individually:

### Start Database Only

```bash
docker-compose up postgres
```

### Start Backend Only

```bash
docker-compose up backend
```

### Start Frontend Only

```bash
docker-compose up frontend
```

## Service Details

### PostgreSQL

- **Image**: postgres:16-alpine
- **Credentials**: 
  - User: securityrat
  - Password: securityrat
  - Database: securityrat
- **Port**: 5432
- **Data**: Persisted in Docker volume `postgres_data`

### Backend API

- **Image**: Built from `apps/backend/Dockerfile`
- **Port**: 3000
- **Environment Variables**:
  - `DATABASE_URL`: Connection string to PostgreSQL
  - `JWT_SECRET`: Secret for JWT tokens (default: supersecret)
  - `REDIS_URL`: Connection string to Redis
  - `PORT`: 3000
- **Data**: Persisted in `/app/data` volume

### Frontend

- **Image**: Built from `apps/frontend/Dockerfile`
- **Port**: 5173 (mapped to nginx port 80)
- **Environment Variables**:
  - `VITE_API_BASE_URL`: Base URL for API (default: http://localhost:3000)
- **Reverse Proxy**: Uses nginx to serve static files and proxy API requests

### Redis (Optional)

- **Image**: redis:7-alpine
- **Port**: 6379
- **Data**: Persisted in Docker volume `redis_data`

## Building Images

To rebuild images:

```bash
# Rebuild all images
docker-compose build

# Rebuild specific service
docker-compose build backend
```

## Stopping Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (use with caution)
docker-compose down -v
```

## Environment Variables

You can override environment variables by creating a `.env` file in the project root:

```bash
# .env file example
JWT_SECRET=your-secret-key-here
DATABASE_URL=postgres://customuser:custompass@postgres:5432/customdb
```

## Health Checks

- PostgreSQL has a health check that ensures the database is ready before the backend starts
- Services will restart automatically if they fail

## Troubleshooting

### Port Conflicts

If ports are already in use:
- Stop the conflicting services
- Or change the ports in `docker-compose.yml`

### Database Connection Issues

If the backend can't connect to the database:
- Check that PostgreSQL is healthy: `docker-compose logs postgres`
- Verify the connection string in backend environment variables
- Check that the database user and password match

### Frontend Not Loading

If the frontend doesn't load:
- Check frontend logs: `docker-compose logs frontend`
- Verify that the backend is running and accessible
- Check the nginx configuration

### Clean Build

To perform a clean build (removes all containers and volumes):

```bash
docker-compose down -v
rm -rf apps/backend/data apps/backend/dist apps/frontend/dist
npm run clean:dist
docker-compose up --build
```

## Production Deployment

For production deployment:

1. **Use proper secrets**: Don't use default credentials
2. **Enable HTTPS**: Configure SSL/TLS for nginx
3. **Adjust resource limits**: Set appropriate CPU and memory limits
4. **Enable monitoring**: Add health checks and monitoring
5. **Backup data**: Regularly backup PostgreSQL and Redis data

## Network Configuration

All services are connected to the `security-rat-network` bridge network, allowing them to communicate using service names as hostnames.

## Volume Management

Data volumes are configured to persist data between container restarts:
- `postgres_data`: PostgreSQL database files
- `redis_data`: Redis cache data
- `./apps/backend/data`: Backend application data

To inspect volumes:

```bash
docker volume ls
docker volume inspect security-rat_postgres_data
```

## Logs

View logs for all services:

```bash
docker-compose logs
```

View logs for a specific service:

```bash
docker-compose logs backend
docker-compose logs postgres
```

Follow logs in real-time:

```bash
docker-compose logs -f
```

## Shell Access

Get a shell in a running container:

```bash
# Backend shell
docker-compose exec backend sh

# PostgreSQL shell
docker-compose exec postgres psql -U securityrat -d securityrat

# Redis shell
docker-compose exec redis redis-cli
```

## Rebuilding Dependencies

If you update package dependencies:

```bash
npm install
npm run build
docker-compose build
```

## Notes

- The frontend is configured to proxy API requests to the backend
- All services are configured to restart automatically unless stopped
- Data volumes ensure persistence between container restarts
- Health checks ensure services are ready before dependencies start
