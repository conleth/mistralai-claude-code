# Frontend Dockerfile for Security RAT Modern

# Production stage
FROM nginx:1.25-alpine AS runner

# Copy built files from host
COPY apps/frontend/dist /usr/share/nginx/html

# Copy nginx configuration from frontend directory
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
