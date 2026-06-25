#!/bin/bash
# Global Plate - Development Startup Script
# WSL Native Environment

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🍽️  Global Plate - Development Server Starter"
echo "=============================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "backend/src/main.py" ]; then
    echo -e "${RED}❌ Error: Not in recipe-cook-book directory${NC}"
    echo "Please run this script from /home/waterprooffish99/projects/recipe-cook-book/"
    exit 1
fi

# Function to check if port is available
check_port() {
    local port=$1
    if ss -tlnp | grep -q ":$port "; then
        echo -e "${RED}❌ Port $port is already in use${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Port $port is available${NC}"
        return 0
    fi
}

# Function to check if dependency is installed
check_deps() {
    local dir=$1
    local type=$2
    
    if [ "$type" == "backend" ]; then
        if [ ! -d "$dir/.venv" ] || ! source "$dir/.venv/bin/activate" 2>/dev/null || ! python -c "import fastapi" 2>/dev/null; then
            echo -e "${YELLOW}⚠️  Backend dependencies not installed${NC}"
            echo "Running: cd $dir && source .venv/bin/activate && pip install -r requirements.txt"
            cd "$dir" && source .venv/bin/activate && pip install -r requirements.txt
            echo -e "${GREEN}✅ Backend dependencies installed${NC}"
        else
            echo -e "${GREEN}✅ Backend dependencies OK${NC}"
        fi
    elif [ "$type" == "frontend" ]; then
        if [ ! -d "$dir/node_modules" ]; then
            echo -e "${YELLOW}⚠️  Frontend dependencies not installed${NC}"
            echo "Running: cd $dir && npm install"
            cd "$dir" && npm install
            echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
        else
            echo -e "${GREEN}✅ Frontend dependencies OK${NC}"
        fi
    fi
}

echo "📋 Pre-flight Checks"
echo "--------------------"

# Check ports
echo "Checking ports..."
check_port 8002 || echo -e "${YELLOW}Will use alternative port if backend fails${NC}"
check_port 3000 || echo -e "${YELLOW}Will use alternative port if frontend fails${NC}"
echo ""

# Check dependencies
echo "Checking dependencies..."
check_deps "$SCRIPT_DIR/backend" "backend"
check_deps "$SCRIPT_DIR/frontend" "frontend"
echo ""

# Start backend in background
echo "🚀 Starting Backend on port 8002..."
cd "$SCRIPT_DIR/backend"
source .venv/bin/activate
export PYTHONPATH="$SCRIPT_DIR/backend:$PYTHONPATH"

# Create log directory
mkdir -p "$SCRIPT_DIR/logs"

# Start uvicorn in background
nohup uvicorn src.main:app --reload --host 0.0.0.0 --port 8002 > "$SCRIPT_DIR/logs/backend.log" 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"
echo "   Logs: $SCRIPT_DIR/logs/backend.log"
echo ""

# Wait for backend to start
echo "Waiting for backend to initialize (5 seconds)..."
sleep 5

# Check if backend is running
if ps -p $BACKEND_PID > /dev/null; then
    echo -e "${GREEN}✅ Backend is running${NC}"
    echo "   Health check: http://localhost:8002/health"
else
    echo -e "${RED}❌ Backend failed to start. Check logs: $SCRIPT_DIR/logs/backend.log${NC}"
    exit 1
fi
echo ""

# Start frontend
echo "🎨 Starting Frontend on port 3000..."
cd "$SCRIPT_DIR/frontend"

# Start npm in background
nohup npm start > "$SCRIPT_DIR/logs/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"
echo "   Logs: $SCRIPT_DIR/logs/frontend.log"
echo ""

# Wait for frontend to start
echo "Waiting for frontend to initialize (10 seconds)..."
sleep 10

# Final status
echo ""
echo "=============================================="
echo "🎉 Global Plate Development Servers Running!"
echo "=============================================="
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:8002"
echo "📊 API Docs: http://localhost:8002/docs"
echo ""
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "To stop servers:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "View logs:"
echo "  tail -f $SCRIPT_DIR/logs/backend.log"
echo "  tail -f $SCRIPT_DIR/logs/frontend.log"
echo ""
echo "🍳 Access your recipes at: http://localhost:3000"
echo "   Look for the Chicken Sajji card! 🇵🇰"
echo ""

# Keep script running to show logs (optional - comment out if you want to detach)
# echo "Press Ctrl+C to stop both servers..."
# wait $BACKEND_PID $FRONTEND_PID

