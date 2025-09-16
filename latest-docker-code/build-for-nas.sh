#!/bin/bash

echo "🐳 Building AMD64 Docker image for Synology NAS..."

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not in PATH"
    echo "Please install Docker Desktop and try again"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running"
    echo "Please start Docker Desktop and try again"
    exit 1
fi

echo "✅ Docker is available and running"

# Build the Docker image for AMD64 architecture (Synology NAS)
echo "🔨 Building AMD64 Docker image..."
docker buildx build \
    --platform linux/amd64 \
    --file Dockerfile.nas \
    --tag rent-management-app:latest \
    --output type=docker,dest=rent-management-app.tar \
    .

if [ $? -eq 0 ]; then
    echo "✅ Docker image built successfully!"
    echo ""
    echo "📦 Image saved as: rent-management-app.tar"
    echo "📁 Location: $(pwd)/rent-management-app.tar"
    echo ""
    echo "🚀 To deploy on Synology NAS:"
    echo "1. Copy rent-management-app.tar to your Synology NAS"
    echo "2. Open Synology DSM → Package Center → Container Manager"
    echo "3. Go to Images tab → Import → From file"
    echo "4. Select rent-management-app.tar"
    echo "5. Click Import"
    echo "6. Create a new container from the imported image"
    echo "7. Set port mapping: 3000:3000"
    echo "8. Mount data folder: /app/data (for CSV files)"
    echo "9. Start the container"
    echo ""
    echo "🌐 Access the application at: http://your-nas-ip:3000"
else
    echo "❌ Docker build failed"
    exit 1
fi