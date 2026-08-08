from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import date, datetime

class EscalaItemCreate(BaseModel):
    membro_id: int
    setor_id: int
    funcao: Optional[str] = None

class EscalaItemResponse(BaseModel):
    id: int
    escala_id: int
    membro_id: int
    setor_id: int
    funcao: Optional[str] = None
    membro_nome: Optional[str] = None
    membro_foto: Optional[str] = None
    setor_nome: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class EscalaBase(BaseModel):
    titulo: str
    tipo_escala: str = "GERAL" # GERAL, EBI
    mes_ano: Optional[str] = None
    data: date
    horario: str
    culto: str
    observacoes: Optional[str] = None
    dados_matriz: Optional[str] = None

class EscalaCreate(EscalaBase):
    itens: List[EscalaItemCreate] = []

class EscalaUpdate(BaseModel):
    titulo: Optional[str] = None
    tipo_escala: Optional[str] = None
    mes_ano: Optional[str] = None
    data: Optional[date] = None
    horario: Optional[str] = None
    culto: Optional[str] = None
    observacoes: Optional[str] = None
    dados_matriz: Optional[str] = None
    itens: Optional[List[EscalaItemCreate]] = None

class EscalaResponse(EscalaBase):
    id: int
    created_at: datetime
    itens: List[EscalaItemResponse] = []

    model_config = ConfigDict(from_attributes=True)
