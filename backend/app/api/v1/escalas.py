from typing import List, Optional
from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.escala import Escala, EscalaItem
from app.models.membro import Membro
from app.models.setor import Setor
from app.models.usuario import Usuario
from app.schemas.escala import EscalaCreate, EscalaUpdate, EscalaResponse, EscalaItemResponse
from app.core.deps import get_current_user, RoleChecker
from app.services.audit_service import log_action
from app.services.excel_service import generate_excel_report, generate_escala_geral_excel, generate_escala_ebi_excel
from app.services.pdf_service import generate_report_pdf, generate_escala_geral_pdf, generate_escala_ebi_pdf

router = APIRouter()

def _format_escala_response(escala: Escala) -> EscalaResponse:
    res = EscalaResponse.model_validate(escala)
    itens_resp = []
    for item in escala.itens:
        item_dict = EscalaItemResponse.model_validate(item)
        if item.membro:
            item_dict.membro_nome = item.membro.nome
            item_dict.membro_foto = item.membro.foto
        if item.setor:
            item_dict.setor_nome = item.setor.nome
        itens_resp.append(item_dict)
    res.itens = itens_resp
    return res


@router.get("", response_model=List[EscalaResponse])
@router.get("/", response_model=List[EscalaResponse])
def list_escalas(
    data_inicio: Optional[date] = None,
    data_fim: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    query = db.query(Escala)
    if data_inicio:
        query = query.filter(Escala.data >= data_inicio)
    if data_fim:
        query = query.filter(Escala.data <= data_fim)

    escalas = query.order_by(Escala.data.desc()).all()
    return [_format_escala_response(e) for e in escalas]


@router.post("", response_model=EscalaResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=EscalaResponse, status_code=status.HTTP_201_CREATED)
def create_escala(
    data: EscalaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(RoleChecker(["Administrador", "Secretário", "Pastor", "Líder"]))
):
    escala = Escala(
        titulo=data.titulo,
        tipo_escala=data.tipo_escala or "GERAL",
        mes_ano=data.mes_ano,
        data=data.data,
        horario=data.horario,
        culto=data.culto,
        observacoes=data.observacoes,
        dados_matriz=data.dados_matriz
    )
    db.add(escala)
    db.commit()
    db.refresh(escala)

    for item in data.itens:
        ei = EscalaItem(
            escala_id=escala.id,
            membro_id=item.membro_id,
            setor_id=item.setor_id,
            funcao=item.funcao
        )
        db.add(ei)

    db.commit()
    db.refresh(escala)
    log_action(db, current_user.id, current_user.nome, "CREATE", "escalas", escala.id, f"Escala criada: {escala.titulo}")
    return _format_escala_response(escala)


@router.get("/{escala_id}", response_model=EscalaResponse)
def get_escala(
    escala_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    escala = db.query(Escala).filter(Escala.id == escala_id).first()
    if not escala:
        raise HTTPException(status_code=404, detail="Escala não encontrada")
    return _format_escala_response(escala)


@router.put("/{escala_id}", response_model=EscalaResponse)
def update_escala(
    escala_id: int,
    data: EscalaUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(RoleChecker(["Administrador", "Secretário", "Pastor", "Líder"]))
):
    escala = db.query(Escala).filter(Escala.id == escala_id).first()
    if not escala:
        raise HTTPException(status_code=404, detail="Escala não encontrada")

    if data.titulo is not None:
        escala.titulo = data.titulo
    if data.tipo_escala is not None:
        escala.tipo_escala = data.tipo_escala
    if data.mes_ano is not None:
        escala.mes_ano = data.mes_ano
    if data.data is not None:
        escala.data = data.data
    if data.horario is not None:
        escala.horario = data.horario
    if data.culto is not None:
        escala.culto = data.culto
    if data.observacoes is not None:
        escala.observacoes = data.observacoes
    if data.dados_matriz is not None:
        escala.dados_matriz = data.dados_matriz

    if data.itens is not None:
        db.query(EscalaItem).filter(EscalaItem.escala_id == escala_id).delete()
        for item in data.itens:
            ei = EscalaItem(
                escala_id=escala.id,
                membro_id=item.membro_id,
                setor_id=item.setor_id,
                funcao=item.funcao
            )
            db.add(ei)

    db.commit()
    db.refresh(escala)
    log_action(db, current_user.id, current_user.nome, "UPDATE", "escalas", escala.id, f"Escala atualizada: {escala.titulo}")
    return _format_escala_response(escala)


@router.post("/{escala_id}/duplicar", response_model=EscalaResponse)
def duplicar_escala(
    escala_id: int,
    nova_data: date,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(RoleChecker(["Administrador", "Secretário", "Pastor", "Líder"]))
):
    original = db.query(Escala).filter(Escala.id == escala_id).first()
    if not original:
        raise HTTPException(status_code=404, detail="Escala original não encontrada")

    nova_escala = Escala(
        titulo=f"{original.titulo} (Cópia)",
        data=nova_data,
        horario=original.horario,
        culto=original.culto,
        observacoes=original.observacoes
    )
    db.add(nova_escala)
    db.commit()
    db.refresh(nova_escala)

    for item in original.itens:
        ei = EscalaItem(
            escala_id=nova_escala.id,
            membro_id=item.membro_id,
            setor_id=item.setor_id,
            funcao=item.funcao
        )
        db.add(ei)

    db.commit()
    db.refresh(nova_escala)
    log_action(db, current_user.id, current_user.nome, "DUPLICATE", "escalas", nova_escala.id, f"Escala duplicada da escala #{escala_id}")
    return _format_escala_response(nova_escala)


@router.delete("/{escala_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_escala(
    escala_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(RoleChecker(["Administrador", "Secretário", "Pastor"]))
):
    escala = db.query(Escala).filter(Escala.id == escala_id).first()
    if not escala:
        raise HTTPException(status_code=404, detail="Escala não encontrada")

    db.delete(escala)
    db.commit()
    log_action(db, current_user.id, current_user.nome, "DELETE", "escalas", escala_id, f"Escala excluída: #{escala_id}")


@router.get("/{escala_id}/exportar/excel")
def exportar_escala_excel(
    escala_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    escala = db.query(Escala).filter(Escala.id == escala_id).first()
    if not escala:
        raise HTTPException(status_code=404, detail="Escala não encontrada")

    if escala.dados_matriz:
        try:
            import json
            payload = json.loads(escala.dados_matriz)
            filename = f"escala_{escala.id}_{escala.mes_ano or '2026'}.xlsx".replace("/", "_")
            if escala.tipo_escala == "EBI":
                url = generate_escala_ebi_excel(escala.titulo, escala.mes_ano or "AGOSTO/2026", payload, filename)
            else:
                url = generate_escala_geral_excel(escala.titulo, escala.mes_ano or "AGOSTO/2026", payload, filename)
            return {"url": url}
        except Exception as e:
            print(f"[EXCEL EXPORT ERR] {e}")

    headers = ["Setor", "Função / Instrumento", "Membro Escalado"]
    rows = [[item.setor.nome if item.setor else "", item.funcao or "-", item.membro.nome if item.membro else ""] for item in escala.itens]
    filename = f"escala_{escala.id}_{escala.data.strftime('%Y%m%d')}.xlsx"
    url = generate_excel_report(f"Escala: {escala.titulo}", headers, rows, filename)
    return {"url": url}


@router.get("/{escala_id}/exportar/pdf")
def exportar_escala_pdf(
    escala_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    escala = db.query(Escala).filter(Escala.id == escala_id).first()
    if not escala:
        raise HTTPException(status_code=404, detail="Escala não encontrada")

    if escala.dados_matriz:
        try:
            import json
            payload = json.loads(escala.dados_matriz)
            filename = f"escala_{escala.id}_{escala.mes_ano or '2026'}.pdf".replace("/", "_")
            if escala.tipo_escala == "EBI":
                url = generate_escala_ebi_pdf(escala.titulo, escala.mes_ano or "AGOSTO/2026", payload, filename)
            else:
                url = generate_escala_geral_pdf(escala.titulo, escala.mes_ano or "AGOSTO/2026", payload, filename)
            return {"url": url}
        except Exception as e:
            print(f"[PDF EXPORT ERR] {e}")

    headers = ["Setor", "Função", "Membro Escalado"]
    rows = [[item.setor.nome if item.setor else "", item.funcao or "-", item.membro.nome if item.membro else ""] for item in escala.itens]
    filename = f"escala_{escala.id}_{escala.data.strftime('%Y%m%d')}.pdf"
    title = f"{escala.titulo} ({escala.mes_ano or ''})"
    url = generate_report_pdf(title, headers, rows, filename)
    return {"url": url}
