#!/bin/bash

echo "🐳 Testing Docker build locally..."

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not in PATH"
    echo "Please install Docker Desktop for Mac"
    exit 1
fi

echo "✅ Docker is available"

# List files to verify structure
echo "📁 Current directory contents:"
ls -la

echo "📦 Package.json contents:"
cat package.json

echo "🔨 Building Docker image..."
docker build -f Dockerfile.simple -t rent-app-test .

if [ $? -eq 0 ]; then
    echo "✅ Docker build successful!"
    echo "🧪 Testing container startup..."
    docker run --rm -p 3000:3000 --name rent-test rent-app-test &
    sleep 10
    
    # Test if the container is responding
    if curl -f http://localhost:3000/api/test > /dev/null 2>&1; then
        echo "✅ Container is running and responding!"
    else
        echo "⚠️  Container may not be responding properly"
    fi
    
    # Stop the test container
    docker stop rent-test
    echo "🧹 Cleaned up test container"
else
    echo "❌ Docker build failed"
    exit 1
fi 