from typing import Optional, List
from sqlalchemy import String, Boolean, Integer, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class Setor(Base):
    __tablename__ = "setores"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    nome: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    descricao: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ativo: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    membro_setores: Mapped[List["MembroSetor"]] = relationship("MembroSetor", back_populates="setor", cascade="all, delete-orphan")


class MembroSetor(Base):
    __tablename__ = "membro_setores"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    membro_id: Mapped[int] = mapped_column(Integer, ForeignKey("membros.id", ondelete="CASCADE"), nullable=False)
    setor_id: Mapped[int] = mapped_column(Integer, ForeignKey("setores.id", ondelete="CASCADE"), nullable=False)
    funcao: Mapped[Optional[str]] = mapped_column(String(100), nullable=True) # e.g. Vocalista, Dirigente, Integrante
    ativo: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    membro: Mapped["Membro"] = relationship("Membro", back_populates="membro_setores")
    setor: Mapped["Setor"] = relationship("Setor", back_populates="membro_setores")
