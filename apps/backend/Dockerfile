# Backend Dockerfile for Security RAT Modern

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Copy built files from host
COPY apps/backend/dist ./dist
COPY apps/backend/package*.json ./
COPY packages/*/dist ./packages/
COPY node_modules ./node_modules

# Create data directory
RUN mkdir -p /app/data

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/index.js"]
