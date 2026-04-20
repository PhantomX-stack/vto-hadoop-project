.PHONY: setup dev demo clean

setup:
	pip install -r backend/requirements.txt
	cd frontend && npm install
	docker compose up -d
	@echo "✅ Setup complete! Run 'make dev' to start."

dev:
	docker compose up -d
	(cd backend && uvicorn app:app --host 0.0.0.0 --port 8000 --reload &) ; \
	cd frontend && npm run dev

clean:
	docker compose down -v
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null
	rm -rf frontend/node_modules

status:
	@docker compose ps
	@curl -s http://localhost:8000/docs > /dev/null && echo "Backend: ✅ Running" || echo "Backend: ❌ Down"
