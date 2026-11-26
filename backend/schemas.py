
from datetime import date
from typing import Literal
from pydantic import BaseModel, Field, ConfigDict


ApplicationStatus = Literal[
    "Applied",
    "Interview",
    "Assessment",
    "Rejected",
    "Selected"
]


class ApplicationCreate(BaseModel):
    company: str = Field(min_length=1)
    role: str = Field(min_length=1)
    date: date
    status: ApplicationStatus = "Applied"


class ApplicationUpdate(BaseModel):
    company: str = Field(min_length=1)
    role: str = Field(min_length=1)
    date: date
    status: ApplicationStatus


class ApplicationResponse(BaseModel):
    id: int
    company: str
    role: str
    date: date
    status: ApplicationStatus

    model_config = ConfigDict(from_attributes=True)
