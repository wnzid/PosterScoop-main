# PosterScoop

PosterScoop is a full-stack platform for browsing and ordering poster designs. The backend exposes a REST API built with Flask and SQLAlchemy, while the frontend is a React application styled with Material UI.

## Project Structure

- `backend/` – Flask API, database models, and uploaded assets.
- `frontend/` – React client with routing and UI components.

## Prerequisites

- Python 3.10+
- Node.js 18+

## Backend Setup

1. `cd backend`
2. (Optional) create and activate a virtual environment.
3. `pip install -r requirements.txt`
4. Configure environment variables as needed:
   - `DATABASE_URL` – database connection string (defaults to a local SQLite file).
   - `ADMIN_EMAIL` and `ADMIN_PASSWORD` – credentials for the initial administrator account.
5. `python app.py`

The API will start on port 5004 by default.

## Frontend Setup

1. `cd frontend`
2. `npm install`
3. `npm start` – launches the React development server and the Flask backend concurrently.

Use `npm run react` to run only the React client on port 3004.

## Testing

- Backend: `pytest` (no tests are currently defined).
- Frontend: `npm test` (runs `react-scripts test`).

## License

No license file is provided. All rights reserved.
