# PosterScoop — Fly.io Deploy Pack (Backend + Frontend + Wasabi + PostgreSQL)

This pack gives you production-ready Dockerfiles and `fly.toml` templates to deploy:
- **Flask backend** on Fly.io (with Gunicorn)
- **React frontend** on Fly.io (served by Nginx)
- **Images** stored on **Wasabi** (S3-compatible)
- **User & order data** stored in **PostgreSQL** (Fly Postgres)

---

## 0) Prereqs
- Install the Fly CLI: https://fly.io/docs/hands-on/install-flyctl/
- `fly auth signup` (or `fly auth login`)
- Your repo layout should be:
  ```
  backend/   # Flask app with app.py (exposes `app`) or create_app()
  frontend/  # React app created with CRA/Vite/Next (this pack assumes CRA/Vite static build)
  ```

---

## 1) Backend on Fly
1. Rename **backend/fly.toml** `app` to a unique name, e.g. `posterscoop-backend-<random>`
2. In your repo root, run:
   ```bash
   fly launch --copy-config --path backend --now --no-deploy
   ```
   (This reuses the provided `fly.toml` while creating the app.)

3. Create a **Fly Postgres** DB and attach:
   ```bash
   fly postgres create --name posterscoop-db --region waw --initial-cluster-size 1 --vm-size shared-cpu-1x --volume-size 10
   fly postgres attach --app <your-backend-app> posterscoop-db
   ```
   The `attach` step sets `DATABASE_URL` in your backend app.

4. Set **Wasabi** + CORS secrets on the backend:
   ```bash
   fly secrets set          WASABI_ACCESS_KEY_ID=...          WASABI_SECRET_ACCESS_KEY=...          WASABI_REGION=eu-central-1          WASABI_ENDPOINT=s3.eu-central-1.wasabisys.com          WASABI_BUCKET=posterscoop-media          FRONTEND_ORIGIN=https://<your-frontend-app>.fly.dev
   ```

   Your Flask code should use these to configure `boto3`:
   - Endpoint: `$WASABI_ENDPOINT` (the app will prefix `https://` if missing)
   - Region: `$WASABI_REGION`
   - Bucket: `$WASABI_BUCKET`

   Example snippet (not deployed by this pack):
   ```python
   import os, boto3
   endpoint = os.environ["WASABI_ENDPOINT"]
   if not endpoint.startswith("http"):
       endpoint = f"https://{endpoint}"
   s3 = boto3.client(
       "s3",
       endpoint_url=endpoint,
       aws_access_key_id=os.environ["WASABI_ACCESS_KEY_ID"],
       aws_secret_access_key=os.environ["WASABI_SECRET_ACCESS_KEY"],
       region_name=os.environ.get("WASABI_REGION","us-east-1"),
   )
   BUCKET = os.environ["WASABI_BUCKET"]
  ```

5. Deploy backend:
   ```bash
   fly deploy --path backend
   ```

---

## 2) Frontend on Fly (React via Nginx)
1. Rename **frontend/fly.toml** `app` to a unique name, e.g. `posterscoop-frontend-<random>`
2. Point the frontend to your backend API via env at build-time:
   - For CRA/Vite, add `REACT_APP_API_BASE` or `VITE_API_BASE` as needed.
   - Then set it at deploy time:
     ```bash
     fly secrets set REACT_APP_API_BASE=https://<your-backend-app>.fly.dev --app <your-frontend-app>
     ```

3. Deploy frontend:
   ```bash
   fly deploy --path frontend
   ```

---

## 3) CORS Notes
- Backend should allow your production frontend origin:
  - Read `FRONTEND_ORIGIN` and use Flask-Cors, e.g.:
    ```python
    from flask_cors import CORS
    import os
    app = ...  # your Flask app
    CORS(app, resources={r"/api/*": {"origins": os.environ.get("FRONTEND_ORIGIN","*")}})
    ```

---

## 4) Useful Fly commands
```bash
# Logs
fly logs --app <app-name>

# Set/Update secrets
fly secrets set KEY=VALUE --app <app-name>

# Scale (optional)
fly scale count 1 --app <app-name>
fly scale memory 512 --app <app-name>
```

---

## 5) Wasabi Bucket Setup (quick)
- Create bucket (e.g., `posterscoop-media`) in a region close to your Fly region.
- (Optional) Enable bucket versioning & lifecycle to auto-delete incomplete uploads or old versions.
- Create programmatic user with access key/secret restricted to this bucket.

---

## 6) Frontend/Backend Local .env (optional)
- You can keep local `.env` files for dev, but **never** commit secrets.
- In production, **always** use `fly secrets`.

---

## 7) Troubleshooting
- Backend 502? Check that gunicorn is binding `0.0.0.0:8080` and app import path is `wsgi:app`.
- CORS errors? Verify `FRONTEND_ORIGIN` matches exactly (protocol + domain).
- DB connectivity? Ensure `DATABASE_URL` is present (it’s auto-set by `fly postgres attach`).

---

**You now have everything needed to deploy PosterScoop on Fly.io with Wasabi + Postgres.**
