import os
import shutil
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.core.database import get_db
from app.core.config import settings
from app.models.membro import Membro
from app.models.setor import Setor, MembroSetor
from app.models.usuario import Usuario
from app.schemas.membro import MembroCreate, MembroUpdate, MembroResponse, SetorSimpleResponse
from app.core.deps import get_current_user, RoleChecker
from app.services.audit_service import log_action

router = APIRouter()

@router.get("", response_model=List[MembroResponse])
@router.get("/", response_model=List[MembroResponse])
def list_membros(
    nome: Optional[str] = None,
    cpf: Optional[str] = None,
    telefone: Optional[str] = None,
    congregacao: Optional[str] = None,
    situacao: Optional[str] = None,
    setor_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    query = db.query(Membro)

    if nome:
        query = query.filter(Membro.nome.ilike(f"%{nome}%"))
    if cpf:
        query = query.filter(Membro.cpf.ilike(f"%{cpf}%"))
    if telefone:
        query = query.filter(or_(Membro.telefone.ilike(f"%{telefone}%"), Membro.whatsapp.ilike(f"%{telefone}%")))
    if congregacao:
        query = query.filter(Membro.congregacao.ilike(f"%{congregacao}%"))
    if situacao:
        query = query.filter(Membro.situacao == situacao)
    if setor_id:
        query = query.join(MembroSetor).filter(MembroSetor.setor_id == setor_id)

    membros = query.order_by(Membro.nome.asc()).all()

    result = []
    for m in membros:
        setores_list = []
        for ms in m.membro_setores:
            if ms.setor:
                setores_list.append(SetorSimpleResponse(id=ms.setor.id, nome=ms.setor.nome, funcao=ms.funcao))
        
        m_dict = MembroResponse.model_validate(m)
        m_dict.setores = setores_list
        result.append(m_dict)

    return result


@router.post("", response_model=MembroResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=MembroResponse, status_code=status.HTTP_201_CREATED)
def create_membro(
    data: MembroCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(RoleChecker(["Administrador", "Secretário", "Pastor"]))
):
    membro = Membro(**data.model_dump(exclude={"setor_ids"}))
    db.add(membro)
    db.commit()
    db.refresh(membro)

    if data.setor_ids:
        for s_id in data.setor_ids:
            ms = MembroSetor(membro_id=membro.id, setor_id=s_id, ativo=True)
            db.add(ms)
        db.commit()
        db.refresh(membro)

    log_action(db, current_user.id, current_user.nome, "CREATE", "membros", membro.id, f"Membro criado: {membro.nome}")
    
    setores_list = [SetorSimpleResponse(id=ms.setor.id, nome=ms.setor.nome, funcao=ms.funcao) for ms in membro.membro_setores if ms.setor]
    res = MembroResponse.model_validate(membro)
    res.setores = setores_list
    return res


@router.get("/{membro_id}", response_model=MembroResponse)
def get_membro(
    membro_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    membro = db.query(Membro).filter(Membro.id == membro_id).first()
    if not membro:
        raise HTTPException(status_code=404, detail="Membro não encontrado")

    setores_list = [SetorSimpleResponse(id=ms.setor.id, nome=ms.setor.nome, funcao=ms.funcao) for ms in membro.membro_setores if ms.setor]
    res = MembroResponse.model_validate(membro)
    res.setores = setores_list
    return res


@router.put("/{membro_id}", response_model=MembroResponse)
def update_membro(
    membro_id: int,
    data: MembroUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(RoleChecker(["Administrador", "Secretário", "Pastor"]))
):
    membro = db.query(Membro).filter(Membro.id == membro_id).first()
    if not membro:
        raise HTTPException(status_code=404, detail="Membro não encontrado")

    update_dict = data.model_dump(exclude_unset=True)
    setor_ids = update_dict.pop("setor_ids", None)

    for field, val in update_dict.items():
        setattr(membro, field, val)

    if setor_ids is not None:
        db.query(MembroSetor).filter(MembroSetor.membro_id == membro_id).delete()
        for s_id in setor_ids:
            ms = MembroSetor(membro_id=membro.id, setor_id=s_id, ativo=True)
            db.add(ms)

    db.commit()
    db.refresh(membro)

    log_action(db, current_user.id, current_user.nome, "UPDATE", "membros", membro.id, f"Membro atualizado: {membro.nome}")

    setores_list = [SetorSimpleResponse(id=ms.setor.id, nome=ms.setor.nome, funcao=ms.funcao) for ms in membro.membro_setores if ms.setor]
    res = MembroResponse.model_validate(membro)
    res.setores = setores_list
    return res


@router.delete("/{membro_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_membro(
    membro_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(RoleChecker(["Administrador"]))
):
    membro = db.query(Membro).filter(Membro.id == membro_id).first()
    if not membro:
        raise HTTPException(status_code=404, detail="Membro não encontrado")

    db.delete(membro)
    db.commit()
    log_action(db, current_user.id, current_user.nome, "DELETE", "membros", membro_id, f"Membro excluído: {membro.nome}")


@router.post("/{membro_id}/foto")
def upload_foto(
    membro_id: int,
    file: Optional[UploadFile] = File(None),
    foto: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(RoleChecker(["Administrador", "Secretário", "Pastor"]))
):
    upload_file = file or foto
    if not upload_file:
        raise HTTPException(status_code=400, detail="Nenhum arquivo de foto enviado")

    membro = db.query(Membro).filter(Membro.id == membro_id).first()
    if not membro:
        raise HTTPException(status_code=404, detail="Membro não encontrado")

    output_dir = os.path.join(settings.UPLOAD_DIR, "fotos")
    os.makedirs(output_dir, exist_ok=True)

    ext = os.path.splitext(upload_file.filename)[1] if upload_file.filename else ".jpg"
    filename = f"foto_membro_{membro_id}_{uuid.uuid4().hex[:8]}{ext}"
    filepath = os.path.join(output_dir, filename)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)

    foto_url = f"/uploads/fotos/{filename}"
    membro.foto = foto_url
    db.commit()

    log_action(db, current_user.id, current_user.nome, "UPLOAD_FOTO", "membros", membro_id, f"Foto atualizada para {membro.nome}")
    return {"foto_url": foto_url}


@router.post("/{membro_id}/documentos")
def upload_documento(
    membro_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(RoleChecker(["Administrador", "Secretário", "Pastor"]))
):
    membro = db.query(Membro).filter(Membro.id == membro_id).first()
    if not membro:
        raise HTTPException(status_code=404, detail="Membro não encontrado")

    output_dir = os.path.join(settings.UPLOAD_DIR, "documentos")
    os.makedirs(output_dir, exist_ok=True)

    ext = os.path.splitext(file.filename)[1] or ".pdf"
    filename = f"doc_membro_{membro_id}_{uuid.uuid4().hex[:8]}{ext}"
    filepath = os.path.join(output_dir, filename)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    doc_url = f"/uploads/documentos/{filename}"
    log_action(db, current_user.id, current_user.nome, "UPLOAD_DOC", "membros", membro_id, f"Documento {file.filename} enviado para {membro.nome}")
    return {"documento_url": doc_url, "nome_original": file.filename}

