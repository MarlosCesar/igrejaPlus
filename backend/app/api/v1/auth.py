from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.usuario import Usuario
from app.schemas.auth import Token, LoginRequest
from app.schemas.usuario import UsuarioResponse
from app.core.deps import get_current_user
from app.services.audit_service import log_action

router = APIRouter()

@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(Usuario).filter(Usuario.login == login_data.login).first()
    if not user or not verify_password(login_data.senha, user.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Login ou senha incorretos",
        )
    if not user.ativo:
        raise HTTPException(status_code=400, detail="Usuário desativado")

    access_token = create_access_token(subject=user.id)

    log_action(db, user.id, user.nome, "LOGIN", "usuarios", user.id, "Login efetuado com sucesso")

    return Token(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        user_nome=user.nome,
        user_nivel=user.nivel
    )

@router.get("/me", response_model=UsuarioResponse)
def get_me(current_user: Usuario = Depends(get_current_user)):
    return current_user
