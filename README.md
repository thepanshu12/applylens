# applylens
# ApplyLens – Job Application Tracker

ApplyLens is a full-stack web application that helps students and job seekers manage their job and internship applications in one place.

## Features

- Add, edit, and delete job applications
- Track application statuses: Applied, Interview, Assessment, Rejected, and Selected
- Search and filter applications
- View application statistics on a dashboard
- Store application data persistently using PostgreSQL
- REST API built with FastAPI

## Tech Stack

**Frontend**
- React
- TypeScript
- Vite
- CSS

**Backend**
- Python
- FastAPI
- SQLAlchemy
- Pydantic

**Database**
- PostgreSQL

## Project Structure

```text
applylens/
├── frontend/
│   └── src/
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   └── schemas.py
└── README.md
```

## Running Locally

### 1. Start the backend

```bash
cd backend
source .venv/bin/activate
python -m uvicorn main:app --reload --port 8002
```

### 2. Start the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

### 3. Open the application

Visit `http://localhost:5175/`.

### API Documentation

Once the backend is running, visit:

`http://127.0.0.1:8002/docs`

## Future Improvements

- User authentication
- Resume analysis using AI
- Application deadline reminders
- Data visualization and analytics
- Cloud deployment

---

**ApplyLens** – Organize your applications. Track your progress. Stay career-ready.
