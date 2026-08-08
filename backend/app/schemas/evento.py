from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import date, datetime

class EventoBase(BaseModel):
    titulo: str
    descricao: Optional[str] = None
    data_evento: date
    hora_evento: Optional[str] = None
    local: Optional[str] = "Sede Principal"
    requer_inscricao: bool = True
    ativo: bool = True

class EventoCreate(EventoBase):
    model_config = ConfigDict(extra="ignore")

class EventoUpdate(BaseModel):
    titulo: Optional[str] = None
    descricao: Optional[str] = None
    data_evento: Optional[date] = None
    hora_evento: Optional[str] = None
    local: Optional[str] = None
    requer_inscricao: Optional[bool] = None
    ativo: Optional[bool] = None

    model_config = ConfigDict(extra="ignore")

class InscricaoEventoCreate(BaseModel):
    evento_id: int
    nome: str
    cpf: Optional[str] = None
    telefone: Optional[str] = None
    email: Optional[str] = None
    endereco: Optional[str] = None
    congregacao: Optional[str] = None

    model_config = ConfigDict(extra="ignore")

class InscricaoEventoResponse(BaseModel):
    id: int
    evento_id: int
    membro_id: Optional[int] = None
    usuario_id: Optional[int] = None
    nome: str
    cpf: Optional[str] = None
    telefone: Optional[str] = None
    email: Optional[str] = None
    endereco: Optional[str] = None
    congregacao: Optional[str] = None
    presenca_confirmada: bool
    data_inscricao: datetime

    model_config = ConfigDict(from_attributes=True)

class EventoResponse(EventoBase):
    id: int
    data_criacao: datetime
    total_inscritos: Optional[int] = 0
    inscricoes: Optional[List[InscricaoEventoResponse]] = []

    model_config = ConfigDict(from_attributes=True)
