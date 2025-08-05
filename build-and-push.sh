#!/bin/bash

# Build and Push Docker Image Script
# This script builds the Docker image and pushes it to Docker Hub

set -e

# Configuration
DOCKER_USERNAME="your-docker-username"  # Replace with your Docker Hub username
IMAGE_NAME="rent-management-app"
TAG="latest"

echo "🐳 Building Docker image..."

# Build the image
docker build -t ${DOCKER_USERNAME}/${IMAGE_NAME}:${TAG} .

echo "✅ Image built successfully!"

echo "🔐 Logging into Docker Hub..."
docker login

echo "📤 Pushing image to Docker Hub..."
docker push ${DOCKER_USERNAME}/${IMAGE_NAME}:${TAG}

echo "🎉 Image pushed successfully!"
echo "📋 Your image is now available at: docker.io/${DOCKER_USERNAME}/${IMAGE_NAME}:${TAG}"
echo ""
echo "📖 To use on Synology NAS:"
echo "1. Go to Container Manager → Image"
echo "2. Click 'Add' → 'Add from Docker Hub'"
echo "3. Search for: ${DOCKER_USERNAME}/${IMAGE_NAME}"
echo "4. Download the image"
echo "5. Create container from the downloaded image" 