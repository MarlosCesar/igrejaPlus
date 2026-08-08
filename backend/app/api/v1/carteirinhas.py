from typing import List, Optional
from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.carteirinha import Carteirinha
from app.models.membro import Membro
from app.models.system import Configuracao
from app.models.usuario import Usuario
from app.schemas.carteirinha import CarteirinhaCreate, CarteirinhaResponse
from app.core.deps import get_current_user, RoleChecker
from app.services.qr_service import generate_qr_code
from app.services.pdf_service import generate_carteirinha_pdf
from app.services.audit_service import log_action

router = APIRouter()

def _format_carteirinha_response(c: Carteirinha) -> CarteirinhaResponse:
    res = CarteirinhaResponse.model_validate(c)
    if c.membro:
        res.membro_nome = c.membro.nome
        res.membro_foto = c.membro.foto
        res.congregacao = c.membro.congregacao
    return res

@router.get("", response_model=List[CarteirinhaResponse])
@router.get("/", response_model=List[CarteirinhaResponse])
def list_carteirinhas(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    query = db.query(Carteirinha)
    if current_user.nivel == "Membro":
        query = query.join(Membro).filter(Membro.nome.ilike(f"%{current_user.nome}%"))
    carteirinhas = query.order_by(Carteirinha.id.desc()).all()
    return [_format_carteirinha_response(c) for c in carteirinhas]

@router.get("/pendentes")
def list_membros_pendentes(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Returns list of members who do NOT have an issued carteirinha yet.
    """
    issued_membro_ids = [c.membro_id for c in db.query(Carteirinha.membro_id).all()]
    query = db.query(Membro).filter(~Membro.id.in_(issued_membro_ids))
    if current_user.nivel == "Membro":
        query = query.filter(Membro.nome.ilike(f"%{current_user.nome}%"))

    pendentes = query.all()
    return [
        {
            "id": m.id,
            "nome": m.nome,
            "cargo": m.cargo or "Membro",
            "congregacao": m.congregacao or "Jardim Primavera",
            "foto": m.foto,
            "cpf": m.cpf,
            "data_batismo": m.data_batismo.strftime("%d/%m/%Y") if m.data_batismo else None
        }
        for m in pendentes
    ]

@router.post("", response_model=CarteirinhaResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=CarteirinhaResponse, status_code=status.HTTP_201_CREATED)
def gerar_carteirinha(
    data: CarteirinhaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(RoleChecker(["Administrador", "Secretário", "Pastor"]))
):
    membro = db.query(Membro).filter(Membro.id == data.membro_id).first()
    if not membro:
        raise HTTPException(status_code=404, detail="Membro não encontrado")

    config = db.query(Configuracao).first()
    igreja_nome = config.nome_igreja if config else "Igreja Cristã Nova Vida"

    dt_emissao = date.today()

    # QR Code payload text
    qr_payload = f"IGREJA CRISTÃ NOVA VIDA | MEMBRO VERIFICADO: {membro.nome} | CPF: {membro.cpf or 'N/A'} | Cargo: {membro.cargo or 'Membro'} | Emissão: {dt_emissao.strftime('%d/%m/%Y')}"
    qr_filename = f"qr_membro_{membro.id}.png"
    qr_url = generate_qr_code(qr_payload, qr_filename)

    carteirinha = db.query(Carteirinha).filter(Carteirinha.membro_id == data.membro_id).first()
    if not carteirinha:
        carteirinha = Carteirinha(
            membro_id=membro.id,
            numero=f"MBR-{membro.id}",
            emissao=dt_emissao,
            validade=dt_emissao,
            qr_code=qr_url,
            status="Ativa"
        )
        db.add(carteirinha)
    else:
        carteirinha.emissao = dt_emissao
        carteirinha.qr_code = qr_url
        carteirinha.status = "Ativa"

    db.commit()
    db.refresh(carteirinha)

    log_action(db, current_user.id, current_user.nome, "GENERATE_CARD", "carteirinhas", carteirinha.id, f"Carteirinha gerada/atualizada para {membro.nome}")
    return _format_carteirinha_response(carteirinha)

@router.get("/{carteirinha_id}/pdf")
def baixar_carteirinha_pdf(
    carteirinha_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    carteirinha = db.query(Carteirinha).filter(Carteirinha.id == carteirinha_id).first()
    if not carteirinha:
        raise HTTPException(status_code=404, detail="Carteirinha não encontrada")

    membro = carteirinha.membro
    config = db.query(Configuracao).first()
    igreja_nome = config.nome_igreja if config else "Igreja Cristã Nova Vida"

    pdf_url = generate_carteirinha_pdf(
        membro_nome=membro.nome,
        cargo=membro.cargo or "Membro",
        congregacao=membro.congregacao or "Jardim Primavera",
        emissao=carteirinha.emissao.strftime("%d/%m/%Y"),
        data_batismo=membro.data_batismo.strftime("%d/%m/%Y") if membro.data_batismo else None,
        qr_code_path=carteirinha.qr_code,
        foto_path=membro.foto,
        igreja_nome=igreja_nome
    )

    return {"pdf_url": pdf_url}

@router.delete("/{carteirinha_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_carteirinha(
    carteirinha_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(RoleChecker(["Administrador", "Secretário", "Pastor"]))
):
    carteirinha = db.query(Carteirinha).filter(Carteirinha.id == carteirinha_id).first()
    if not carteirinha:
        raise HTTPException(status_code=404, detail="Carteirinha não encontrada")

    db.delete(carteirinha)
    db.commit()
    return None
