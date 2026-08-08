from pydantic import BaseModel
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

import secrets
import string

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
        user_nivel=user.nivel,
        exige_nova_senha=bool(user.exige_nova_senha)
    )

class RecuperarSenhaRequest(BaseModel):
    identificador: str # login ou e-mail

class AlterarSenhaProvisoriaRequest(BaseModel):
    login: str
    senha_provisoria: str
    nova_senha: str

@router.post("/recuperar-senha")
def recuperar_senha(data: RecuperarSenhaRequest, db: Session = Depends(get_db)):
    ident = data.identificador.strip().lower()
    from app.models.membro import Membro
    user = db.query(Usuario).filter(Usuario.login.ilike(ident)).first()
    if not user:
        # Search by email in Membro
        membro = db.query(Membro).filter(Membro.email.ilike(ident)).first()
        if membro:
            user = db.query(Usuario).filter(Usuario.nome == membro.nome).first()

    if not user:
        raise HTTPException(status_code=404, detail="Usuário ou e-mail não localizado no sistema")

    # Generate 6-char temporary password (e.g. A9k2X7)
    chars = string.ascii_uppercase + string.digits
    senha_provisoria = ''.join(secrets.choice(chars) for _ in range(6))

    user.senha_hash = get_password_hash(senha_provisoria)
    user.exige_nova_senha = True
    db.commit()

    log_action(db, user.id, user.nome, "RECOVER_PASS", "usuarios", user.id, "Senha provisória gerada para recuperação")

    return {
        "message": f"Senha provisória gerada com sucesso para o usuário '{user.login}'. Use esta senha para acessar o sistema e cadastrar sua nova senha definitiva.",
        "login": user.login,
        "senha_provisoria": senha_provisoria
    }

@router.post("/alterar-senha-provisoria", response_model=Token)
def alterar_senha_provisoria(data: AlterarSenhaProvisoriaRequest, db: Session = Depends(get_db)):
    if len(data.nova_senha) < 4:
        raise HTTPException(status_code=400, detail="A nova senha deve ter pelo menos 4 caracteres")

    user = db.query(Usuario).filter(Usuario.login == data.login).first()
    if not user or not verify_password(data.senha_provisoria, user.senha_hash):
        raise HTTPException(status_code=400, detail="Login ou senha provisória incorretos")

    user.senha_hash = get_password_hash(data.nova_senha)
    user.exige_nova_senha = False
    db.commit()
    db.refresh(user)

    log_action(db, user.id, user.nome, "CHANGE_PASS", "usuarios", user.id, "Nova senha definitiva cadastrada com sucesso")

    access_token = create_access_token(subject=user.id)
    return Token(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        user_nome=user.nome,
        user_nivel=user.nivel,
        exige_nova_senha=False
    )

@router.get("/me", response_model=UsuarioResponse)
def get_me(current_user: Usuario = Depends(get_current_user)):
    return current_user

from pydantic import BaseModel
class RegisterRequest(BaseModel):
    nome: str
    login: str
    senha: str
    email: str = None
    telefone: str = None

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register_self(data: RegisterRequest, db: Session = Depends(get_db)):
    if not data.nome or not data.login or not data.senha:
        raise HTTPException(status_code=400, detail="Nome, login e senha são obrigatórios")

    existing_user = db.query(Usuario).filter(Usuario.login == data.login).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Este login de usuário já está em uso")

    new_user = Usuario(
        nome=data.nome,
        login=data.login,
        senha_hash=get_password_hash(data.senha),
        nivel="Membro",
        ativo=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Also auto-create Membro entry if not present
    from app.models.membro import Membro
    membro = db.query(Membro).filter(Membro.nome == data.nome).first()
    if not membro:
        membro = Membro(
            nome=data.nome,
            email=data.email,
            telefone=data.telefone,
            cargo="Membro",
            situacao="Ativo"
        )
        db.add(membro)
        db.commit()

    log_action(db, new_user.id, new_user.nome, "REGISTER", "usuarios", new_user.id, "Cadastro de novo usuário com nível Membro")

    access_token = create_access_token(subject=new_user.id)
    return Token(
        access_token=access_token,
        token_type="bearer",
        user_id=new_user.id,
        user_nome=new_user.nome,
        user_nivel=new_user.nivel
    )

@router.post("/visitante", response_model=Token)
def login_visitante(db: Session = Depends(get_db)):
    # Create guest token
    access_token = create_access_token(subject=0)
    return Token(
        access_token=access_token,
        token_type="bearer",
        user_id=0,
        user_nome="Visitante",
        user_nivel="Visitante"
    )
