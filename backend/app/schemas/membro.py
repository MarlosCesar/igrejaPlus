from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import date, datetime

class MembroBase(BaseModel):
    nome: str
    cpf: Optional[str] = None
    rg: Optional[str] = None
    data_nascimento: Optional[date] = None
    sexo: Optional[str] = None
    estado_civil: Optional[str] = None
    telefone: Optional[str] = None
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    cep: Optional[str] = None
    endereco: Optional[str] = None
    numero: Optional[str] = None
    complemento: Optional[str] = None
    bairro: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    data_batismo: Optional[date] = None
    data_conversao: Optional[date] = None
    data_membro: Optional[date] = None
    congregacao: Optional[str] = None
    cargo: Optional[str] = "Membro" # Membro, Diácono, Missionário, Pastor, Obreiro, Bispo
    situacao: str = "Ativo"
    observacoes: Optional[str] = None
    foto: Optional[str] = None

class MembroCreate(MembroBase):
    setor_ids: Optional[List[int]] = []
    model_config = ConfigDict(extra="ignore")

class MembroUpdate(BaseModel):
    nome: Optional[str] = None
    cpf: Optional[str] = None
    rg: Optional[str] = None
    data_nascimento: Optional[date] = None
    sexo: Optional[str] = None
    estado_civil: Optional[str] = None
    telefone: Optional[str] = None
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    cep: Optional[str] = None
    endereco: Optional[str] = None
    numero: Optional[str] = None
    complemento: Optional[str] = None
    bairro: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    data_batismo: Optional[date] = None
    data_conversao: Optional[date] = None
    data_membro: Optional[date] = None
    congregacao: Optional[str] = None
    cargo: Optional[str] = None
    situacao: Optional[str] = None
    observacoes: Optional[str] = None
    foto: Optional[str] = None
    setor_ids: Optional[List[int]] = None
    
    model_config = ConfigDict(extra="ignore")

class SetorSimpleResponse(BaseModel):
    id: int
    nome: str
    funcao: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class MembroResponse(MembroBase):
    id: int
    created_at: datetime
    updated_at: datetime
    setores: List[SetorSimpleResponse] = []
    
    model_config = ConfigDict(from_attributes=True)
