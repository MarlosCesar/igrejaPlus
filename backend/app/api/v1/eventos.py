from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.evento import Evento, InscricaoEvento
from app.models.membro import Membro
from app.models.usuario import Usuario
from app.schemas.evento import (
    EventoCreate, EventoUpdate, EventoResponse,
    InscricaoEventoCreate, InscricaoEventoResponse
)
from app.core.deps import get_current_user, RoleChecker
from app.services.pdf_service import generate_relatorio_evento_pdf
from app.services.audit_service import log_action

router = APIRouter()

def _format_evento_response(ev: Evento) -> EventoResponse:
    res = EventoResponse.model_validate(ev)
    res.total_inscritos = len(ev.inscricoes) if ev.inscricoes else 0
    return res

@router.get("", response_model=List[EventoResponse])
@router.get("/", response_model=List[EventoResponse])
def list_eventos(
    db: Session = Depends(get_db)
):
    eventos = db.query(Evento).order_by(Evento.data_evento.asc(), Evento.id.desc()).all()
    return [_format_evento_response(ev) for ev in eventos]

@router.post("", response_model=EventoResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=EventoResponse, status_code=status.HTTP_201_CREATED)
def criar_evento(
    data: EventoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(RoleChecker(["Administrador", "Pastor", "Secretário"]))
):
    evento = Evento(**data.model_dump())
    db.add(evento)
    db.commit()
    db.refresh(evento)

    log_action(db, current_user.id, current_user.nome, "CREATE", "eventos", evento.id, f"Evento criado: {evento.titulo}")
    return _format_evento_response(evento)

@router.put("/{evento_id}", response_model=EventoResponse)
def atualizar_evento(
    evento_id: int,
    data: EventoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(RoleChecker(["Administrador", "Pastor", "Secretário"]))
):
    evento = db.query(Evento).filter(Evento.id == evento_id).first()
    if not evento:
        raise HTTPException(status_code=404, detail="Evento não encontrado")

    for field, val in data.model_dump(exclude_unset=True).items():
        setattr(evento, field, val)

    db.commit()
    db.refresh(evento)

    log_action(db, current_user.id, current_user.nome, "UPDATE", "eventos", evento.id, f"Evento atualizado: {evento.titulo}")
    return _format_evento_response(evento)

@router.delete("/{evento_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_evento(
    evento_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(RoleChecker(["Administrador", "Pastor"]))
):
    evento = db.query(Evento).filter(Evento.id == evento_id).first()
    if not evento:
        raise HTTPException(status_code=404, detail="Evento não encontrado")

    db.delete(evento)
    db.commit()
    return None

@router.post("/{evento_id}/inscrever", response_model=InscricaoEventoResponse)
def inscrever_evento(
    evento_id: int,
    data: InscricaoEventoCreate,
    db: Session = Depends(get_db)
):
    evento = db.query(Evento).filter(Evento.id == evento_id).first()
    if not evento:
        raise HTTPException(status_code=404, detail="Evento não encontrado")

    if not evento.ativo:
        raise HTTPException(status_code=400, detail="Este evento está inativo no momento")

    # Check if already registered by CPF or Name
    if data.cpf:
        existing = db.query(InscricaoEvento).filter(
            InscricaoEvento.evento_id == evento_id,
            InscricaoEvento.cpf == data.cpf
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Você já está inscrito neste evento")

    membro_id = None
    membro = db.query(Membro).filter(Membro.nome == data.nome).first()
    if membro:
        membro_id = membro.id

    inscricao = InscricaoEvento(
        evento_id=evento_id,
        membro_id=membro_id,
        nome=data.nome,
        cpf=data.cpf,
        telefone=data.telefone,
        email=data.email,
        endereco=data.endereco,
        congregacao=data.congregacao or "Jardim Primavera"
    )
    db.add(inscricao)
    db.commit()
    db.refresh(inscricao)

    return inscricao

@router.get("/{evento_id}/relatorio-pdf")
def relatorio_evento_pdf(
    evento_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(RoleChecker(["Administrador", "Pastor", "Secretário"]))
):
    evento = db.query(Evento).filter(Evento.id == evento_id).first()
    if not evento:
        raise HTTPException(status_code=404, detail="Evento não encontrado")

    inscritos = evento.inscricoes or []
    dt_str = evento.data_evento.strftime("%d/%m/%Y")

    pdf_url = generate_relatorio_evento_pdf(
        titulo_evento=evento.titulo,
        data_evento=f"{dt_str} às {evento.hora_evento or '19:00'}",
        local=evento.local or "Sede Principal",
        inscritos=inscritos
    )

    return {"pdf_url": pdf_url}
