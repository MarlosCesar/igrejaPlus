from pydantic import BaseModel, ConfigDict
from typing import Optional, List

class SetorBase(BaseModel):
    nome: str
    descricao: Optional[str] = None
    ativo: bool = True

class SetorCreate(SetorBase):
    pass

class SetorUpdate(BaseModel):
    nome: Optional[str] = None
    descricao: Optional[str] = None
    ativo: Optional[bool] = None

class SetorResponse(SetorBase):
    id: int
    membros_count: int = 0

    model_config = ConfigDict(from_attributes=True)

class MembroSetorCreate(BaseModel):
    membro_id: int
    setor_id: int
    funcao: Optional[str] = None
    ativo: bool = True
