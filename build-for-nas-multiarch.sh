#!/bin/bash

echo "🐳 Building multi-architecture Docker image for Synology NAS..."

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not in PATH"
    echo "Please install Docker Desktop for Mac from: https://www.docker.com/products/docker-desktop/"
    exit 1
fi

echo "✅ Docker is available"

# Check if Docker Buildx is available
if ! docker buildx version &> /dev/null; then
    echo "❌ Docker Buildx is not available"
    echo "Please update Docker Desktop to the latest version"
    exit 1
fi

echo "✅ Docker Buildx is available"

# Create a new builder instance for multi-platform builds
echo "🔧 Setting up multi-platform builder..."
docker buildx create --name multiarch-builder --use 2>/dev/null || docker buildx use multiarch-builder

# Build the Docker image for multiple architectures
echo "🔨 Building multi-architecture Docker image..."
docker buildx build \
    --platform linux/amd64,linux/arm64 \
    --file Dockerfile.simple \
    --tag rent-management-app:latest \
    --output type=docker,dest=rent-management-app.tar \
    .

if [ $? -eq 0 ]; then
    echo "✅ Multi-architecture Docker build successful!"
    
    # Get file size
    FILE_SIZE=$(du -h rent-management-app.tar | cut -f1)
    
    echo "✅ Image saved as rent-management-app.tar"
    echo ""
    echo "📋 Next steps for Synology NAS:"
    echo "1. Upload rent-management-app.tar to your NAS"
    echo "2. Open Container Manager → Image"
    echo "3. Click 'Add' → 'Add from local'"
    echo "4. Select the rent-management-app.tar file"
    echo "5. Import the image"
    echo "6. Create container from the imported image"
    echo ""
    echo "📁 File location: $(pwd)/rent-management-app.tar"
    echo "📏 File size: $FILE_SIZE"
    echo "🏗️  Architecture: Multi-platform (AMD64 + ARM64)"
else
    echo "❌ Docker build failed"
    exit 1
fi 