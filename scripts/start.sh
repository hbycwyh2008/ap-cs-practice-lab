#!/usr/bin/env bash
set -euo pipefail

echo "Starting AP CS Practice Lab..."
docker compose up --build -d

echo "Waiting for backend..."
sleep 8

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
