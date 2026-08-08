from typing import Optional
from sqlalchemy.orm import Session
from app.models.system import AuditLog

def log_action(
    db: Session,
    usuario_id: Optional[int],
    usuario_nome: Optional[str],
    acao: str,
    tabela: str,
    registro_id: Optional[int] = None,
    detalhes: Optional[str] = None,
    ip: Optional[str] = None
):
    """
    Creates an entry in logs table.
    """
    log_entry = AuditLog(
        usuario_id=usuario_id,
        usuario_nome=usuario_nome,
        acao=acao,
        tabela=tabela,
        registro_id=registro_id,
        detalhes=detalhes,
        ip=ip
    )
    db.add(log_entry)
    db.commit()
