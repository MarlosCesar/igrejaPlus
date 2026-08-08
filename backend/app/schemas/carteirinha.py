from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date

class CarteirinhaBase(BaseModel):
    membro_id: int
    numero: str
    emissao: date
    validade: date
    status: str = "Ativa"

class CarteirinhaCreate(BaseModel):
    membro_id: int
    validade_meses: int = 12

class CarteirinhaResponse(CarteirinhaBase):
    id: int
    qr_code: Optional[str] = None
    membro_nome: Optional[str] = None
    membro_foto: Optional[str] = None
    congregacao: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
