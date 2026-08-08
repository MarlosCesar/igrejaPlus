from datetime import date
from typing import Optional
from sqlalchemy import String, Date, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class Carteirinha(Base):
    __tablename__ = "carteirinhas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    membro_id: Mapped[int] = mapped_column(Integer, ForeignKey("membros.id", ondelete="CASCADE"), nullable=False)
    numero: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    emissao: Mapped[date] = mapped_column(Date, nullable=False)
    validade: Mapped[date] = mapped_column(Date, nullable=False)
    qr_code: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="Ativa") # Ativa, Vencida, Cancelada

    # Relationships
    membro: Mapped["Membro"] = relationship("Membro", back_populates="carteirinhas")
