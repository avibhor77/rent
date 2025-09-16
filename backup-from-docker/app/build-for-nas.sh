#!/bin/bash

echo "🐳 Building Docker image for Synology NAS..."

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not in PATH"
    echo "Please install Docker Desktop for Mac from: https://www.docker.com/products/docker-desktop/"
    exit 1
fi

echo "✅ Docker is available"

# Build the Docker image
echo "🔨 Building Docker image..."
docker build -f Dockerfile.simple -t rent-management-app .

if [ $? -eq 0 ]; then
    echo "✅ Docker build successful!"
    
    # Save the image as a tar file
    echo "💾 Saving image as tar file..."
    docker save rent-management-app -o rent-management-app.tar
    
    if [ $? -eq 0 ]; then
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
        echo "📏 File size: $(du -h rent-management-app.tar | cut -f1)"
    else
        echo "❌ Failed to save Docker image"
        exit 1
    fi
else
    echo "❌ Docker build failed"
    exit 1
fi 