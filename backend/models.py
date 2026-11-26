
from datetime import date
from typing import Literal

from sqlalchemy import Date, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    company: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    role: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    date: Mapped[date] = mapped_column(
        Date,
        default=date.today,
        nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(50),
        default="Applied",
        nullable=False
    )

    def __repr__(self):
        return (
            f"<Application id={self.id} "
            f"company={self.company!r} "
            f"role={self.role!r}>"
        )
