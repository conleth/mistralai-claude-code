#!/bin/bash

# Security RAT Modern - Standup Script
# This script builds and starts all services with the frontend exposed on port 1234

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print section headers
print_section() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  $1${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════════════════════╝${NC}"
}

# Function to print success messages
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to print info messages
print_info() {
    echo -e "${BLUE}📋 $1${NC}"
}

# Function to print warning messages
print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to print error messages
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Docker is running
check_docker() {
    print_section "Checking Docker"
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Check if Docker Compose is available
check_docker_compose() {
    print_section "Checking Docker Compose"
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install it and try again."
        exit 1
    fi
    print_success "Docker Compose is available"
}

# Clean up previous containers
clean_up() {
    print_section "Cleaning Up Previous Containers"
    if docker-compose ps > /dev/null 2>&1; then
        print_info "Stopping and removing previous containers..."
        docker-compose down -v 2>/dev/null || true
        print_success "Previous containers cleaned up"
    else
        print_info "No previous containers found"
    fi
}

# Build packages and apps
build_packages() {
    print_section "Building Packages and Apps"
    
    # Build packages in dependency order
    # This ensures packages are built before apps that depend on them
    print_info "Building @security-rat/types..."
    cd packages/types && npm run build && cd ../..
    print_success "@security-rat/types built"
    
    print_info "Building @security-rat/standards..."
    cd packages/standards && npm run build && cd ../..
    print_success "@security-rat/standards built"
    
    print_info "Building @security-rat/rules-engine..."
    cd packages/rules-engine && npm run build && cd ../..
    print_success "@security-rat/rules-engine built"
    
    print_info "Building @security-rat/integrations..."
    cd packages/integrations && npm run build && cd ../..
    print_success "@security-rat/integrations built"
    
    print_info "Building @security-rat/questionnaire..."
    cd packages/questionnaire && npm run build && cd ../..
    print_success "All packages built"
    
    # Build backend
    print_info "Building backend..."
    cd apps/backend && npm run build && cd ../..
    print_success "Backend built"
    
    # Build frontend
    print_info "Building frontend..."
    cd apps/frontend && npm run build && cd ../..
    print_success "Frontend built"
    
    print_info "All builds completed successfully!"
    echo -e "${GREEN}Built files are in:${NC}"
    echo -e "${GREEN}  - packages/*/dist${NC}"
    echo -e "${GREEN}  - apps/backend/dist${NC}"
    echo -e "${GREEN}  - apps/frontend/dist${NC}"
}

# Build Docker images
build_images() {
    print_section "Building Docker Images"
    print_info "Building backend image..."
    docker-compose build backend
    print_success "Backend image built"
    
    print_info "Building frontend image..."
    docker-compose build frontend
    print_success "Frontend image built"
}

# Start services
start_services() {
    print_section "Starting Services"
    print_info "Starting PostgreSQL, Redis, Backend, and Frontend..."
    
    # Start in detached mode
    docker-compose up -d
    
    # Wait for services to be ready
    print_info "Waiting for services to start..."
    sleep 10
    
    # Check if services are running
    if docker-compose ps | grep -q "Exit"; then
        print_warning "Some services may have issues. Checking logs..."
        docker-compose logs --tail 20
    else
        print_success "All services started successfully"
    fi
}

# Verify services
verify_services() {
    print_section "Verifying Services"
    
    # Check PostgreSQL
    if docker-compose exec postgres pg_isready -U securityrat -d securityrat > /dev/null 2>&1; then
        print_success "PostgreSQL is ready"
    else
        print_warning "PostgreSQL may not be ready yet"
    fi
    
    # Check Backend
    if curl -s http://localhost:3000/health > /dev/null 2>&1; then
        print_success "Backend API is ready"
    else
        print_warning "Backend API may not be ready yet"
    fi
    
    # Check Frontend
    if curl -s http://localhost:1234 > /dev/null 2>&1; then
        print_success "Frontend is ready on http://localhost:1234"
    else
        print_warning "Frontend may not be ready yet"
    fi
}

# Display access information
show_access_info() {
    print_section "Access Information"
    echo -e "${GREEN}Frontend:${NC} http://localhost:1234"
    echo -e "${GREEN}Backend API:${NC} http://localhost:3000"
    echo -e "${GREEN}PostgreSQL:${NC} localhost:5432 (user: securityrat, password: securityrat)"
    echo -e "${GREEN}Redis:${NC} localhost:6379"
}

# Show logs
show_logs() {
    print_section "Viewing Logs"
    echo -e "${BLUE}To view logs in real-time, run:${NC}"
    echo -e "${YELLOW}  docker-compose logs -f${NC}"
    echo -e "${BLUE}To view specific service logs, run:${NC}"
    echo -e "${YELLOW}  docker-compose logs <service-name>${NC}"
}

# Main execution
main() {
    # Check prerequisites
    check_docker
    check_docker_compose
    
    # Clean up
    clean_up
    
    # Build packages in correct order
    build_packages
    
    # Final message
    print_section "Standup Complete"
    echo -e "${GREEN}✅ All packages and apps built successfully!${NC}"
    echo -e "${GREEN}✅ Use 'docker-compose up -d' to start services${NC}"
}

# Run main function
main
