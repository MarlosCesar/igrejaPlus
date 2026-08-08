from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_password_hash
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate, UsuarioResponse
from app.core.deps import get_current_user, RoleChecker
from app.services.audit_service import log_action

router = APIRouter()

@router.get("", response_model=List[UsuarioResponse])
@router.get("/", response_model=List[UsuarioResponse])
def list_usuarios(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(RoleChecker(["Administrador", "Pastor", "Secretário"]))
):
    usuarios = db.query(Usuario).order_by(Usuario.nome.asc()).all()
    return usuarios


@router.post("", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
def create_usuario(
    data: UsuarioCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(RoleChecker(["Administrador"]))
):
    existing = db.query(Usuario).filter(Usuario.login == data.login).first()
    if existing:
        raise HTTPException(status_code=400, detail="Login já em uso por outro usuário")

    hashed_pw = get_password_hash(data.senha)
    user = Usuario(
        nome=data.nome,
        login=data.login,
        senha_hash=hashed_pw,
        nivel=data.nivel,
        ativo=data.ativo
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    log_action(db, current_user.id, current_user.nome, "CREATE", "usuarios", user.id, f"Usuário criado: {user.login}")
    return user


@router.put("/{usuario_id}", response_model=UsuarioResponse)
def update_usuario(
    usuario_id: int,
    data: UsuarioUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(RoleChecker(["Administrador"]))
):
    user = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    if data.nome is not None:
        user.nome = data.nome
    if data.login is not None:
        user.login = data.login
    if data.nivel is not None:
        user.nivel = data.nivel
    if data.ativo is not None:
        user.ativo = data.ativo
    if data.senha:
        user.senha_hash = get_password_hash(data.senha)

    db.commit()
    db.refresh(user)

    log_action(db, current_user.id, current_user.nome, "UPDATE", "usuarios", user.id, f"Usuário atualizado: {user.login}")
    return user


@router.delete("/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(RoleChecker(["Administrador"]))
):
    if current_user.id == usuario_id:
        raise HTTPException(status_code=400, detail="Você não pode excluir seu próprio usuário")

    user = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    db.delete(user)
    db.commit()
    log_action(db, current_user.id, current_user.nome, "DELETE", "usuarios", usuario_id, f"Usuário excluído: #{usuario_id}")
