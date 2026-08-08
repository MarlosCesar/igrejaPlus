from datetime import datetime
from typing import Optional
from sqlalchemy import String, DateTime, Integer, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class AuditLog(Base):
    __tablename__ = "logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    usuario_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("usuarios.id", ondelete="SET NULL"), nullable=True)
    usuario_nome: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    acao: Mapped[str] = mapped_column(String(100), index=True, nullable=False) # e.g. CREATED, UPDATED, DELETED, LOGIN
    tabela: Mapped[str] = mapped_column(String(50), index=True, nullable=False) # e.g. membros, escalas
    registro_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    detalhes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ip: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)


class Configuracao(Base):
    __tablename__ = "configuracoes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    nome_igreja: Mapped[str] = mapped_column(String(200), default="Igreja Evangelica Igreja+")
    cnpj: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    pastor_presidente: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    endereco: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    telefone: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    site: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    instagram: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    facebook: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    logo: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
