from datetime import datetime, date
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Date, DateTime, Integer, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

if TYPE_CHECKING:
    from app.models.setor import MembroSetor
    from app.models.carteirinha import Carteirinha

class Membro(Base):
    __tablename__ = "membros"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    nome: Mapped[str] = mapped_column(String(150), index=True, nullable=False)
    cpf: Mapped[Optional[str]] = mapped_column(String(20), index=True, nullable=True)
    rg: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    data_nascimento: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    sexo: Mapped[Optional[str]] = mapped_column(String(20), nullable=True) # Masculino, Feminino
    estado_civil: Mapped[Optional[str]] = mapped_column(String(30), nullable=True) # Solteiro(a), Casado(a), Divorciado(a), Viúvo(a)
    telefone: Mapped[Optional[str]] = mapped_column(String(30), index=True, nullable=True)
    whatsapp: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    cep: Mapped[Optional[str]] = mapped_column(String(15), nullable=True)
    endereco: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    numero: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    complemento: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    bairro: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    cidade: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    estado: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    data_batismo: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    data_conversao: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    data_membro: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    congregacao: Mapped[Optional[str]] = mapped_column(String(100), index=True, nullable=True)
    cargo: Mapped[Optional[str]] = mapped_column(String(50), default="Membro", index=True) # Membro, Diácono, Missionário, Pastor, Obreiro, Bispo
    situacao: Mapped[str] = mapped_column(String(50), default="Ativo", index=True) # Ativo, Inativo, Afastado, Visitante
    observacoes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    foto: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    membro_setores: Mapped[List["MembroSetor"]] = relationship("MembroSetor", back_populates="membro", cascade="all, delete-orphan")
    carteirinhas: Mapped[List["Carteirinha"]] = relationship("Carteirinha", back_populates="membro", cascade="all, delete-orphan")
