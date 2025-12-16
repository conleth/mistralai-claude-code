# Backend Dockerfile for Security RAT Modern

# Use the existing local build
FROM node:20-alpine

WORKDIR /app

# Copy built files from host
COPY dist ./dist
COPY packages/*/dist ./packages/
COPY node_modules ./node_modules

# Create data directory for SQLite
RUN mkdir -p /app/data

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/index.js"]
