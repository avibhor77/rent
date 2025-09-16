#!/bin/bash

echo "🐳 Building ARM64 Docker image for Synology NAS..."

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not in PATH"
    echo "Please install Docker Desktop for Mac from: https://www.docker.com/products/docker-desktop/"
    exit 1
fi

echo "✅ Docker is available"

# Build the Docker image for ARM64 architecture
echo "🔨 Building ARM64 Docker image..."
docker buildx build \
    --platform linux/arm64 \
    --file Dockerfile.nas \
    --tag rent-management-app:latest \
    --output type=docker,dest=rent-management-app.tar \
    .

if [ $? -eq 0 ]; then
    echo "✅ ARM64 Docker build successful!"
    
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
    echo "🏗️  Architecture: ARM64 (aarch64)"
else
    echo "❌ Docker build failed"
    exit 1
fi 