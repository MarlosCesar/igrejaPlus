from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class UsuarioBase(BaseModel):
    nome: Optional[str] = ""
    login: Optional[str] = ""
    nivel: Optional[str] = "Membro"
    ativo: Optional[bool] = True

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
    created_at: Optional[datetime] = None
    exige_nova_senha: Optional[bool] = False

    model_config = ConfigDict(from_attributes=True)
