#!/bin/bash

# CLD3 Language Detector - Server Startup Script
# This script starts the Node.js server

echo "🚀 Starting CLD3 Language Detector Server..."
echo ""

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check if npm dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Start the server
npm start
