from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.system import AuditLog
from app.models.usuario import Usuario
from app.schemas.system import AuditLogResponse
from app.core.deps import get_current_user, RoleChecker

router = APIRouter()

@router.get("", response_model=List[AuditLogResponse])
@router.get("/", response_model=List[AuditLogResponse])
def list_audit_logs(
    tabela: Optional[str] = None,
    usuario_id: Optional[int] = None,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(RoleChecker(["Administrador", "Pastor"]))
):
    query = db.query(AuditLog)
    if tabela:
        query = query.filter(AuditLog.tabela == tabela)
    if usuario_id:
        query = query.filter(AuditLog.usuario_id == usuario_id)

    logs = query.order_by(AuditLog.id.desc()).limit(limit).all()
    return logs
