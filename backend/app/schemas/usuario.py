from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class UsuarioBase(BaseModel):
    nome: str
    login: str
    nivel: str = "Consulta" # Administrador, Secretário, Pastor, Líder, Consulta
    ativo: bool = True

class UsuarioCreate(UsuarioBase):
    senha: str

class UsuarioUpdate(BaseModel):
    nome: Optional[str] = None
    login: Optional[str] = None
    senha: Optional[str] = None
    nivel: Optional[str] = None
    ativo: Optional[bool] = None

class UsuarioResponse(UsuarioBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
