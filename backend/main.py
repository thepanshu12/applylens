
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, get_db, Base
from models import Application
from schemas import (
    ApplicationCreate,
    ApplicationUpdate,
    ApplicationResponse
)


# Create database tables when the application starts.
@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="ApplyLens API",
    description="Backend API for managing internship and job applications.",
    version="2.0.0",
    lifespan=lifespan
)


# Allow React frontend to communicate with FastAPI.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Convert SQLAlchemy objects into JSON-compatible dictionaries.
def serialize_application(application):
    return ApplicationResponse.model_validate(
        application
    ).model_dump(mode="json")


@app.get("/")
def home():
    return {
        "message": "Welcome to ApplyLens API!",
        "status": "Running"
    }


@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(
            __import__("sqlalchemy").text("SELECT 1")
        )
        return {
            "status": "healthy",
            "database": "connected"
        }
    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Database connection unavailable"
        )


# Get all applications.
@app.get("/applications")
def get_applications(db: Session = Depends(get_db)):
    applications = (
        db.query(Application)
        .order_by(Application.id.desc())
        .all()
    )

    return {
        "total": len(applications),
        "applications": [
            serialize_application(application)
            for application in applications
        ]
    }


# Create a new application.
@app.post("/applications", status_code=201)
def create_application(
    application: ApplicationCreate,
    db: Session = Depends(get_db)
):
    new_application = Application(
        company=application.company,
        role=application.role,
        date=application.date,
        status=application.status
    )

    try:
        db.add(new_application)
        db.commit()
        db.refresh(new_application)

        return {
            "message": "Application created successfully",
            "application": serialize_application(new_application)
        }

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to create application"
        )


# Get a single application.
@app.get("/applications/{application_id}")
def get_application(
    application_id: int,
    db: Session = Depends(get_db)
):
    application = db.query(Application).filter(
        Application.id == application_id
    ).first()

    if application is None:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    return serialize_application(application)


# Update an existing application.
@app.put("/applications/{application_id}")
def update_application(
    application_id: int,
    updated_application: ApplicationUpdate,
    db: Session = Depends(get_db)
):
    application = db.query(Application).filter(
        Application.id == application_id
    ).first()

    if application is None:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    application.company = updated_application.company
    application.role = updated_application.role
    application.date = updated_application.date
    application.status = updated_application.status

    try:
        db.commit()
        db.refresh(application)

        return {
            "message": "Application updated successfully",
            "application": serialize_application(application)
        }

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to update application"
        )


# Delete an application.
@app.delete("/applications/{application_id}")
def delete_application(
    application_id: int,
    db: Session = Depends(get_db)
):
    application = db.query(Application).filter(
        Application.id == application_id
    ).first()

    if application is None:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    deleted_application = serialize_application(application)

    try:
        db.delete(application)
        db.commit()

        return {
            "message": "Application deleted successfully",
            "application": deleted_application
        }

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to delete application"
        )
