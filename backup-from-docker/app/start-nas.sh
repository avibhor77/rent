#!/bin/bash

# Rent Management App - NAS Startup Script
# This script helps manage the Docker container on your Synology NAS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
CONTAINER_NAME="rent-management-app"
IMAGE_NAME="rent-app"
PORT="3000"

echo -e "${GREEN}🏠 Rent Management App - NAS Deployment${NC}"
echo "================================================"

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Docker is running${NC}"
}

# Function to build the image
build_image() {
    echo -e "${YELLOW}🔨 Building Docker image...${NC}"
    docker build -t $IMAGE_NAME .
    echo -e "${GREEN}✅ Image built successfully${NC}"
}

# Function to start the container
start_container() {
    echo -e "${YELLOW}🚀 Starting container...${NC}"
    
    # Stop existing container if running
    if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
        echo -e "${YELLOW}⚠️  Stopping existing container...${NC}"
        docker stop $CONTAINER_NAME
        docker rm $CONTAINER_NAME
    fi
    
    # Start new container
    docker run -d \
        --name $CONTAINER_NAME \
        --restart unless-stopped \
        -p $PORT:3000 \
        -v $(pwd)/data:/app/data \
        -v $(pwd)/logs:/app/logs \
        -e NODE_ENV=production \
        -e PORT=3000 \
        $IMAGE_NAME
    
    echo -e "${GREEN}✅ Container started successfully${NC}"
    echo -e "${GREEN}🌐 Access your app at: http://$(hostname -I | awk '{print $1}'):$PORT${NC}"
}

# Function to stop the container
stop_container() {
    echo -e "${YELLOW}🛑 Stopping container...${NC}"
    if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
        docker stop $CONTAINER_NAME
        docker rm $CONTAINER_NAME
        echo -e "${GREEN}✅ Container stopped and removed${NC}"
    else
        echo -e "${YELLOW}⚠️  Container is not running${NC}"
    fi
}

# Function to show logs
show_logs() {
    echo -e "${YELLOW}📋 Container logs:${NC}"
    if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
        docker logs -f $CONTAINER_NAME
    else
        echo -e "${RED}❌ Container is not running${NC}"
    fi
}

# Function to show status
show_status() {
    echo -e "${YELLOW}📊 Container status:${NC}"
    if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
        docker ps -f name=$CONTAINER_NAME
        echo -e "${GREEN}✅ Container is running${NC}"
        echo -e "${GREEN}🌐 Access URL: http://$(hostname -I | awk '{print $1}'):$PORT${NC}"
    else
        echo -e "${RED}❌ Container is not running${NC}"
    fi
}

# Function to update the application
update_app() {
    echo -e "${YELLOW}🔄 Updating application...${NC}"
    
    # Pull latest changes (if using git)
    if [ -d ".git" ]; then
        echo -e "${YELLOW}📥 Pulling latest changes...${NC}"
        git pull
    fi
    
    # Rebuild and restart
    build_image
    start_container
    echo -e "${GREEN}✅ Application updated successfully${NC}"
}

# Function to backup data
backup_data() {
    echo -e "${YELLOW}💾 Creating backup...${NC}"
    BACKUP_DIR="backup/$(date +%Y%m%d_%H%M%S)"
    mkdir -p $BACKUP_DIR
    
    # Backup data files
    cp -r data/ $BACKUP_DIR/
    
    # Backup docker-compose and config files
    cp docker-compose.yml $BACKUP_DIR/
    cp Dockerfile $BACKUP_DIR/
    
    echo -e "${GREEN}✅ Backup created in: $BACKUP_DIR${NC}"
}

# Main script logic
case "${1:-}" in
    "start")
        check_docker
        build_image
        start_container
        ;;
    "stop")
        check_docker
        stop_container
        ;;
    "restart")
        check_docker
        stop_container
        start_container
        ;;
    "logs")
        check_docker
        show_logs
        ;;
    "status")
        check_docker
        show_status
        ;;
    "update")
        check_docker
        update_app
        ;;
    "backup")
        backup_data
        ;;
    "help"|"")
        echo "Usage: $0 {start|stop|restart|logs|status|update|backup|help}"
        echo ""
        echo "Commands:"
        echo "  start   - Build and start the application"
        echo "  stop    - Stop the application"
        echo "  restart - Restart the application"
        echo "  logs    - Show application logs"
        echo "  status  - Show container status"
        echo "  update  - Update and restart the application"
        echo "  backup  - Create a backup of data files"
        echo "  help    - Show this help message"
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac 