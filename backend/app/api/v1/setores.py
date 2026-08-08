from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.setor import Setor, MembroSetor
from app.models.membro import Membro
from app.models.usuario import Usuario
from app.schemas.setor import SetorCreate, SetorUpdate, SetorResponse, MembroSetorCreate
from app.schemas.membro import MembroResponse, SetorSimpleResponse
from app.core.deps import get_current_user, RoleChecker
from app.services.audit_service import log_action

router = APIRouter()

@router.get("", response_model=List[SetorResponse])
@router.get("/", response_model=List[SetorResponse])
def list_setores(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    setores = db.query(Setor).order_by(Setor.nome.asc()).all()
    result = []
    for s in setores:
        count = db.query(func.count(MembroSetor.id)).filter(MembroSetor.setor_id == s.id, MembroSetor.ativo == True).scalar()
        res = SetorResponse.model_validate(s)
        res.membros_count = count or 0
        result.append(res)
    return result


@router.post("", response_model=SetorResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=SetorResponse, status_code=status.HTTP_201_CREATED)
def create_setor(
    data: SetorCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(RoleChecker(["Administrador", "Secretário", "Pastor"]))
):
    existing = db.query(Setor).filter(Setor.nome.ilike(data.nome)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Setor com este nome já existe")

    setor = Setor(**data.model_dump())
    db.add(setor)
    db.commit()
    db.refresh(setor)

    log_action(db, current_user.id, current_user.nome, "CREATE", "setores", setor.id, f"Setor criado: {setor.nome}")
    res = SetorResponse.model_validate(setor)
    res.membros_count = 0
    return res


@router.get("/{setor_id}/membros", response_model=List[MembroResponse])
def get_membros_por_setor(
    setor_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    membros = db.query(Membro).join(MembroSetor).filter(
        MembroSetor.setor_id == setor_id,
        MembroSetor.ativo == True
    ).all()

    result = []
    for m in membros:
        setores_list = [SetorSimpleResponse(id=ms.setor.id, nome=ms.setor.nome, funcao=ms.funcao) for ms in m.membro_setores if ms.setor]
        res = MembroResponse.model_validate(m)
        res.setores = setores_list
        result.append(res)
    return result


@router.post("/membro", status_code=status.HTTP_201_CREATED)
def vincular_membro_setor(
    data: MembroSetorCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(RoleChecker(["Administrador", "Secretário", "Pastor"]))
):
    ms = db.query(MembroSetor).filter(
        MembroSetor.membro_id == data.membro_id,
        MembroSetor.setor_id == data.setor_id
    ).first()

    if ms:
        ms.funcao = data.funcao
        ms.ativo = data.ativo
    else:
        ms = MembroSetor(**data.model_dump())
        db.add(ms)

    db.commit()
    log_action(db, current_user.id, current_user.nome, "LINK", "membro_setores", ms.id, f"Membro {data.membro_id} vinculado ao setor {data.setor_id}")
    return {"message": "Membro vinculado com sucesso ao setor"}


@router.delete("/{setor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_setor(
    setor_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(RoleChecker(["Administrador"]))
):
    setor = db.query(Setor).filter(Setor.id == setor_id).first()
    if not setor:
        raise HTTPException(status_code=404, detail="Setor não encontrado")

    db.delete(setor)
    db.commit()
    log_action(db, current_user.id, current_user.nome, "DELETE", "setores", setor_id, f"Setor excluído: {setor.nome}")
