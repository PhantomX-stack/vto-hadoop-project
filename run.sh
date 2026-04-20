#!/bin/bash
echo "=============================================="
echo "  VTryOn — Virtual Clothing Try-On"
echo "  Starting Backend + Frontend..."
echo "=============================================="
echo ""

# Install backend deps if needed
if [ ! -d "backend/__pycache__" ]; then
  echo "📦 Installing backend dependencies..."
  cd backend && pip install -r requirements.txt -q && cd ..
  echo "✅ Backend deps installed"
  echo ""
fi

# Install frontend deps if needed
if [ ! -d "frontend/node_modules" ]; then
  echo "📦 Installing frontend dependencies..."
  cd frontend && npm install && cd ..
  echo "✅ Frontend deps installed"
  echo ""
fi

echo "🚀 Starting backend on port 8000..."
cd backend && python main.py &
BACK_PID=$!
cd ..

echo "🚀 Starting frontend on port 3000..."
cd frontend && npm run dev &
FRONT_PID=$!
cd ..

echo ""
echo "=============================================="
echo "  ✅ EVERYTHING IS RUNNING!"
echo "=============================================="
echo ""
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:8000"
echo "  API Docs:  http://localhost:8000/docs"
echo ""
echo "  Press Ctrl+C to stop both servers"
echo "=============================================="

trap "kill $BACK_PID $FRONT_PID 2>/dev/null; exit" INT TERM
wait
