# WSGI entrypoint for Gunicorn.
# Ensure your Flask instance is named `app` inside backend/app.py and that the
# database is initialized when the server starts. This mirrors the `init_db()`
# call used when running the app directly (see `app.py`). Without this, new
# tables like `PromoCode` would not be created in environments where the module
# is loaded via Gunicorn, leading to runtime errors.

try:
    # Standard import when `app` is defined at module level
    from app import app, init_db
except ImportError:
    # Fallback: use factory function pattern
    from app import create_app, init_db
    app = create_app()

# Run database initialization on startup
with app.app_context():
    init_db()
