#!/bin/bash

echo "🔍 Validating Docker Image..."

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    exit 1
fi

echo "✅ Docker is available"

# Check if the image exists
if ! docker images | grep -q "rent-management-app"; then
    echo "❌ rent-management-app image not found"
    echo "Building image first..."
    ./build-for-nas-amd64.sh
fi

echo "✅ Image found"

# Test the image locally
echo "🧪 Testing image locally..."

# Stop any existing test container
docker stop rent-test 2>/dev/null
docker rm rent-test 2>/dev/null

# Run the container
echo "🚀 Starting test container..."
docker run -d \
    --name rent-test \
    -p 3001:3000 \
    -v "$(pwd)/data:/app/data" \
    -e NODE_ENV=production \
    -e PORT=3000 \
    rent-management-app:latest

if [ $? -eq 0 ]; then
    echo "✅ Container started successfully"
    
    # Wait for container to be ready
    echo "⏳ Waiting for container to be ready..."
    sleep 10
    
    # Test the API
    echo "🔍 Testing API endpoints..."
    
    # Test health endpoint
    if curl -s http://localhost:3001/api/test > /dev/null; then
        echo "✅ Health check passed"
    else
        echo "❌ Health check failed"
    fi
    
    # Test main API endpoints
    if curl -s http://localhost:3001/api/rent-data > /dev/null; then
        echo "✅ Rent data API working"
    else
        echo "❌ Rent data API failed"
    fi
    
    if curl -s http://localhost:3001/api/meter-data > /dev/null; then
        echo "✅ Meter data API working"
    else
        echo "❌ Meter data API failed"
    fi
    
    # Test frontend
    if curl -s http://localhost:3001/ > /dev/null; then
        echo "✅ Frontend accessible"
    else
        echo "❌ Frontend not accessible"
    fi
    
    # Show container logs
    echo "📋 Container logs:"
    docker logs rent-test --tail 20
    
    # Show container status
    echo "📊 Container status:"
    docker ps | grep rent-test
    
    # Clean up
    echo "🧹 Cleaning up test container..."
    docker stop rent-test
    docker rm rent-test
    
    echo "✅ Validation complete!"
else
    echo "❌ Failed to start container"
    echo "📋 Container logs:"
    docker logs rent-test --tail 20 2>/dev/null || echo "No logs available"
    docker rm rent-test 2>/dev/null
    exit 1
fi 