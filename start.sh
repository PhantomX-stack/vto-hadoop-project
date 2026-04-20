#!/bin/bash
echo "================================================"
echo "  VTryOn - Starting Full Application"
echo "================================================"
echo ""

# Kill any existing processes
echo "[1/4] Cleaning up old processes..."
kill $(lsof -t -i:8000 2>/dev/null) 2>/dev/null
kill $(lsof -t -i:3000 2>/dev/null) 2>/dev/null
sleep 1

# Install backend deps if needed
echo "[2/4] Checking backend dependencies..."
cd /workspaces/vto-hadoop-project/backend
if [ ! -d "venv" ]; then
  python -m venv venv 2>/dev/null || true
fi
source venv/bin/activate 2>/dev/null || true
pip install -q fastapi uvicorn pydantic python-multipart Pillow numpy 2>/dev/null

# Install frontend deps if needed
echo "[3/4] Checking frontend dependencies..."
cd /workspaces/vto-hadoop-project/frontend
if [ ! -d "node_modules" ]; then
  npm install --silent 2>/dev/null
fi

# Start backend in background
echo "[4/4] Starting servers..."
cd /workspaces/vto-hadoop-project/backend
python main.py &
BACKEND_PID=$!
echo "  ✅ Backend started (PID: $BACKEND_PID) on http://localhost:8000"

# Start frontend in background
cd /workspaces/vto-hadoop-project/frontend
npx vite --host 0.0.0.0 --port 3000 &
FRONTEND_PID=$!
echo "  ✅ Frontend started (PID: $FRONTEND_PID) on http://localhost:3000"

echo ""
echo "================================================"
echo "  🚀 VTryOn is LIVE!"
echo "================================================"
echo ""
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:8000"
echo "  API Docs:  http://localhost:8000/docs"
echo ""
echo "  Press Ctrl+C to stop both servers"
echo "================================================"
echo ""

# Wait for Ctrl+C
trap "echo ''; echo 'Stopping servers...'; kill $BACKEND_PID 2>/dev/null; kill $FRONTEND_PID 2>/dev/null; echo '✅ Stopped.'; exit 0" SIGINT SIGTERM
wait
