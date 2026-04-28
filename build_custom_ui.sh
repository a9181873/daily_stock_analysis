#!/bin/bash

# =================================================================
# DSA Custom UI Build Script (video.dky.tw Style)
# =================================================================

IMAGE_NAME="daily-stock-analysis-custom"
TAG="latest"

echo "🚀 Starting custom UI build process..."

# 1. Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed. Please install Docker first."
    exit 1
fi

# 2. Build the Docker image
echo "📦 Building Docker image: ${IMAGE_NAME}:${TAG}"
docker build -t "${IMAGE_NAME}:${TAG}" -f docker/Dockerfile .

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "To run your custom DSA container:"
    echo "docker run -d -p 8000:8000 \\"
    echo "  -v \$(pwd)/data:/app/data \\"
    echo "  -e OPENAI_API_KEY=your_key_here \\"
    echo "  -e ADMIN_AUTH_ENABLED=true \\"
    echo "  ${IMAGE_NAME}:${TAG}"
else
    echo "❌ Build failed. Please check the logs above."
    exit 1
fi
