import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.models.system import Configuracao
from app.models.usuario import Usuario
from app.schemas.system import ConfiguracaoResponse, ConfiguracaoUpdate
from app.core.deps import get_current_user, RoleChecker
from app.services.audit_service import log_action

router = APIRouter()

@router.get("", response_model=ConfiguracaoResponse)
@router.get("/", response_model=ConfiguracaoResponse)
def get_configuracao(db: Session = Depends(get_db)):
    config = db.query(Configuracao).first()
    if not config:
        config = Configuracao(nome_igreja="Igreja Evangelica Igreja+")
        db.add(config)
        db.commit()
        db.refresh(config)
    return config

@router.put("", response_model=ConfiguracaoResponse)
@router.put("/", response_model=ConfiguracaoResponse)
def update_configuracao(
    data: ConfiguracaoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(RoleChecker(["Administrador", "Pastor"]))
):
    config = db.query(Configuracao).first()
    if not config:
        config = Configuracao()
        db.add(config)

    for field, val in data.model_dump(exclude_unset=True).items():
        setattr(config, field, val)

    db.commit()
    db.refresh(config)

    log_action(db, current_user.id, current_user.nome, "UPDATE_CONFIG", "configuracoes", config.id, "Configurações da igreja atualizadas")
    return config

@router.post("/logo")
def upload_logo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(RoleChecker(["Administrador", "Pastor"]))
):
    config = db.query(Configuracao).first()
    if not config:
        config = Configuracao()
        db.add(config)

    output_dir = os.path.join(settings.UPLOAD_DIR, "logos")
    os.makedirs(output_dir, exist_ok=True)

    ext = os.path.splitext(file.filename)[1] or ".png"
    filename = f"logo_igreja_{config.id}{ext}"
    filepath = os.path.join(output_dir, filename)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    logo_url = f"/uploads/logos/{filename}"
    config.logo = logo_url
    db.commit()

    log_action(db, current_user.id, current_user.nome, "UPLOAD_LOGO", "configuracoes", config.id, "Logo da igreja atualizada")
    return {"logo_url": logo_url}
