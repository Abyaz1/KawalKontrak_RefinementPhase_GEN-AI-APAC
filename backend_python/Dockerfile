# =============================================================
# KawalKontrak.ai — Backend Python (FastAPI + Gemini)
# Build : docker build -f Dockerfile.backend -t kawalkontrak-backend .
# Run   : docker run --env-file backend_python/.env -p 8000:8000 kawalkontrak-backend
# Cocok untuk Cloud Run (listen di $PORT jika di-set, default 8000).
#
# Catatan: backend_python/.env dikecualikan lewat .dockerignore agar
# GEMINI_API_KEY tidak ikut ter-bake ke dalam layer image. Di Cloud Run,
# suntikkan lewat Secret Manager (--set-secrets), bukan file .env.
# =============================================================

FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install dependency terlebih dahulu agar layer ter-cache
COPY backend_python/requirements.txt backend_python/requirements.txt
RUN pip install --no-cache-dir -r backend_python/requirements.txt

COPY backend_python backend_python

# Jangan jalan sebagai root
RUN useradd --create-home --uid 1000 appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# Cloud Run menyuntikkan $PORT; fallback 8000 untuk docker lokal
CMD ["sh", "-c", "uvicorn backend_python.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
