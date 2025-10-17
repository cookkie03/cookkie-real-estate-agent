#!/bin/bash
# Run unit tests only

echo "Running Backend unit tests..."
cd backend && npm test

echo ""
echo "Running Frontend unit tests..."
cd ../frontend && npm test
