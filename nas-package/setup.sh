#!/bin/bash

# Rent Management App - Synology Setup Script
# This script helps set up the application on Synology NAS

echo "🏠 Rent Management App - Synology Setup"
echo "========================================"

# Check if running on Synology
if [ ! -f /etc/synoinfo.conf ]; then
    echo "⚠️  Warning: This script is designed for Synology NAS"
    echo "   Proceeding anyway..."
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p ./data
mkdir -p ./logs
mkdir -p ./backup

# Set permissions
echo "🔐 Setting permissions..."
chmod 755 ./data
chmod 755 ./logs
chmod 755 ./backup

# Check if Docker is available
if command -v docker &> /dev/null; then
    echo "✅ Docker is available"
    
    # Load the Docker image
    echo "📦 Loading Docker image..."
    docker load -i rent-management-app.tar
    
    if [ $? -eq 0 ]; then
        echo "✅ Docker image loaded successfully"
        
        # Create and start container
        echo "🚀 Starting container..."
        docker-compose up -d
        
        if [ $? -eq 0 ]; then
            echo "✅ Container started successfully"
            echo ""
            echo "🎉 Setup Complete!"
            echo "=================="
            echo "📱 Access your app at: http://$(hostname -I | awk '{print $1}'):9999"
            echo "🔍 Health check: http://$(hostname -I | awk '{print $1}'):9999/api/health"
            echo "📊 Monitor logs: docker-compose logs -f"
            echo "🛑 Stop app: docker-compose down"
            echo ""
            echo "📋 Next steps:"
            echo "1. Open the app URL in your browser"
            echo "2. Configure your tenant data"
            echo "3. Set up regular backups of the ./data directory"
            echo "4. Consider setting up SSL/HTTPS for production use"
        else
            echo "❌ Failed to start container"
            echo "   Check docker-compose.yml configuration"
            exit 1
        fi
    else
        echo "❌ Failed to load Docker image"
        echo "   Check if rent-management-app.tar exists"
        exit 1
    fi
else
    echo "❌ Docker is not available"
    echo "   Please install Container Manager package on your Synology NAS"
    echo "   Then run this script again"
    exit 1
fi

echo ""
echo "📚 For more information, see SYNOLOGY_DEPLOYMENT_GUIDE.md"
