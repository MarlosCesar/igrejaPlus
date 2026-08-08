from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Date
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Evento(Base):
    __tablename__ = "eventos"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(150), nullable=False)
    descricao = Column(Text, nullable=True)
    data_evento = Column(Date, nullable=False)
    hora_evento = Column(String(20), nullable=True)
    local = Column(String(150), nullable=True, default="Sede Principal")
    requer_inscricao = Column(Boolean, default=True)
    ativo = Column(Boolean, default=True)
    data_criacao = Column(DateTime, default=datetime.utcnow)

    inscricoes = relationship("InscricaoEvento", back_populates="evento", cascade="all, delete-orphan")


class InscricaoEvento(Base):
    __tablename__ = "inscricoes_evento"

    id = Column(Integer, primary_key=True, index=True)
    evento_id = Column(Integer, ForeignKey("eventos.id"), nullable=False)
    membro_id = Column(Integer, ForeignKey("membros.id"), nullable=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)

    nome = Column(String(150), nullable=False)
    cpf = Column(String(20), nullable=True)
    telefone = Column(String(30), nullable=True)
    email = Column(String(100), nullable=True)
    endereco = Column(String(200), nullable=True)
    congregacao = Column(String(100), nullable=True)

    presenca_confirmada = Column(Boolean, default=False)
    data_inscricao = Column(DateTime, default=datetime.utcnow)

    evento = relationship("Evento", back_populates="inscricoes")
    membro = relationship("Membro")
    usuario = relationship("Usuario")
