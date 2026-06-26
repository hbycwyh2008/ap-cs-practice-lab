#!/usr/bin/env bash
set -euo pipefail

echo "Building Java runner Docker image..."
docker build -t ap-cs-java-runner ./runner

echo "Starting services..."
docker compose up -d --build

echo "Waiting for database..."
sleep 5

echo "Running seed script..."
docker compose exec backend python seed.py

echo ""
echo "AP CS Practice Lab is ready!"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:8000"
echo "  API Docs: http://localhost:8000/docs"
echo ""
echo "Demo accounts:"
echo "  Teacher: teacher@example.com / password123"
echo "  Student: student@example.com / password123"
