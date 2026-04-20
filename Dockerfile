# Stage 1: Build Front End
FROM node:20-alpine AS builder
WORKDIR /app
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install
COPY frontend/ ./frontend/
# Setting API_URL to empty tells Next.js to make API calls back to the server serving it (FastAPI)
RUN cd frontend && NEXT_PUBLIC_API_URL="" npm run build

# Stage 2: Build Back End & Serve
FROM python:3.10-slim
WORKDIR /app
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY backend/ ./backend/
COPY data/ ./data/

# Copy the pre-compiled Next.js raw HTML
COPY --from=builder /app/frontend/out ./frontend/out

# Hugging Face Spaces strictly requires 7860
ENV PORT=7860
EXPOSE 7860

# Run FastAPI from the backend directory to resolve all internal python imports correctly
WORKDIR /app/backend
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
