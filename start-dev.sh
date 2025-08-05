#!/bin/bash

echo "Starting Rent Management Application..."
echo "Backend server will run on http://localhost:3001"
echo "Frontend server will run on http://localhost:3000"
echo ""

# Start backend server in background
echo "Starting backend server..."
npm run server &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend server in background
echo "Starting frontend server..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "Both servers are starting..."
echo "Press Ctrl+C to stop both servers"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait 