#!/bin/bash

echo "🏥 MediConnect Backend Server Startup Script"
echo "========================================"
echo ""

# Check if MongoDB is running
echo "🔍 Checking MongoDB connection..."
if command -v mongosh &> /dev/null; then
    mongosh --eval "db.adminCommand('ping')" &> /dev/null
    if [ $? -eq 0 ]; then
        echo "✅ MongoDB is running"
    else
        echo "⚠️  MongoDB is not responding. Make sure MongoDB is started:"
        echo "   Windows: mongod"
        echo "   Mac: brew services start mongodb-community"
        echo "   Linux: sudo systemctl start mongod"
        echo ""
        read -p "Continue anyway? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
else
    echo "⚠️  MongoDB CLI not found, skipping check"
fi

echo ""
echo "📁 Checking backend directory..."
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Are you in the backend directory?"
    exit 1
fi
echo "✅ Backend directory correct"

echo ""
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "📥 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "🔐 Checking .env file..."
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating one..."
    cat > .env << EOF
PORT=5000
MONGO_URI=mongodb://localhost:27017/mediconnect
JWT_SECRET=change_this_secret
FRONTEND_ORIGIN=http://localhost:3000
NODE_ENV=development
EOF
    echo "✅ .env file created with default values"
    echo "⚠️  Make sure to update MONGO_URI if needed"
else
    echo "✅ .env file exists"
fi

echo ""
echo "🚀 Starting MediConnect Backend Server..."
echo "========================================"
echo ""
echo "Server starting on http://localhost:5000"
echo "API endpoint: http://localhost:5000/api"
echo "Health check: http://localhost:5000/api/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Run the server
npm run dev || npm start
