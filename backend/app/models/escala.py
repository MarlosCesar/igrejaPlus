from datetime import date, datetime
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Date, DateTime, Integer, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

if TYPE_CHECKING:
    from app.models.membro import Membro
    from app.models.setor import Setor

class Escala(Base):
    __tablename__ = "escalas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    titulo: Mapped[str] = mapped_column(String(150), nullable=False)
    tipo_escala: Mapped[str] = mapped_column(String(50), default="GERAL", index=True) # GERAL, EBI
    mes_ano: Mapped[Optional[str]] = mapped_column(String(50), nullable=True) # e.g. AGOSTO/2026
    data: Mapped[date] = mapped_column(Date, index=True, nullable=False)
    horario: Mapped[str] = mapped_column(String(20), nullable=False)
    culto: Mapped[str] = mapped_column(String(100), nullable=False) # e.g. Culto de Domingo, Escala EBI
    observacoes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    dados_matriz: Mapped[Optional[str]] = mapped_column(Text, nullable=True) # JSON matrix payload
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    itens: Mapped[List["EscalaItem"]] = relationship("EscalaItem", back_populates="escala", cascade="all, delete-orphan")


class EscalaItem(Base):
    __tablename__ = "escala_itens"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    escala_id: Mapped[int] = mapped_column(Integer, ForeignKey("escalas.id", ondelete="CASCADE"), nullable=False)
    membro_id: Mapped[int] = mapped_column(Integer, ForeignKey("membros.id", ondelete="CASCADE"), nullable=False)
    setor_id: Mapped[int] = mapped_column(Integer, ForeignKey("setores.id", ondelete="CASCADE"), nullable=False)
    funcao: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Relationships
    escala: Mapped["Escala"] = relationship("Escala", back_populates="itens")
    membro: Mapped["Membro"] = relationship("Membro")
    setor: Mapped["Setor"] = relationship("Setor")
