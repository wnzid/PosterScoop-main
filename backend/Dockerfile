# backend/Dockerfile
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PORT=8080

WORKDIR /app

# System deps for psycopg / Pillow, etc.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
  && rm -rf /var/lib/apt/lists/*

# Install Python deps first (better layer caching)
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt && pip install gunicorn

# Copy your app code
COPY . .

# Use the WSGI entrypoint so the DB is initialized on startup
# (see backend/wsgi.py for `init_db()` call)
EXPOSE 8080

CMD ["gunicorn", "-b", "0.0.0.0:8080", "--workers", "3", "wsgi:app"]
