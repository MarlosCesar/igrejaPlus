from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.core.database import get_db
from app.models.membro import Membro
from app.models.setor import Setor
from app.models.carteirinha import Carteirinha
from app.models.usuario import Usuario
from app.schemas.system import SearchResultItem
from app.core.deps import get_current_user

router = APIRouter()

@router.get("", response_model=List[SearchResultItem])
@router.get("/", response_model=List[SearchResultItem])
def busca_global(
    q: str = Query(..., min_length=2, description="Termo de pesquisa"),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    results: List[SearchResultItem] = []
    termo = f"%{q}%"

    # Search Membros (Nome, CPF, Telefone, Congregação)
    membros = db.query(Membro).filter(
        or_(
            Membro.nome.ilike(termo),
            Membro.cpf.ilike(termo),
            Membro.telefone.ilike(termo),
            Membro.whatsapp.ilike(termo),
            Membro.congregacao.ilike(termo)
        )
    ).limit(10).all()

    for m in membros:
        results.append(SearchResultItem(
            id=m.id,
            tipo="membro",
            titulo=m.nome,
            subtitulo=f"CPF: {m.cpf or 'N/A'} | Tel: {m.telefone or m.whatsapp or 'N/A'}",
            detalhe=f"Congregação: {m.congregacao or 'Sede'} • Situação: {m.situacao}"
        ))

    # Search Setores
    setores = db.query(Setor).filter(Setor.nome.ilike(termo)).limit(5).all()
    for s in setores:
        results.append(SearchResultItem(
            id=s.id,
            tipo="setor",
            titulo=f"Setor: {s.nome}",
            subtitulo=s.descricao or "Departamento da Igreja",
            detalhe="Módulo Setores"
        ))

    # Search Carteirinhas by number
    carteirinhas = db.query(Carteirinha).filter(Carteirinha.numero.ilike(termo)).limit(5).all()
    for c in carteirinhas:
        nome_membro = c.membro.nome if c.membro else "Desconhecido"
        results.append(SearchResultItem(
            id=c.id,
            tipo="carteirinha",
            titulo=f"Carteirinha Nº {c.numero}",
            subtitulo=f"Membro: {nome_membro}",
            detalhe=f"Status: {c.status} • Validade: {c.validade.strftime('%d/%m/%Y')}"
        ))

    return results
