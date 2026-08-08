from pydantic import BaseModel, Field
from typing import Optional

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    user_nome: str
    user_nivel: str
    exige_nova_senha: Optional[bool] = False

class TokenPayload(BaseModel):
    sub: Optional[str] = None

class LoginRequest(BaseModel):
    login: str = Field(..., example="admin")
    senha: str = Field(..., example="admin123")
