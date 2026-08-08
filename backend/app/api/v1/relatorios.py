from typing import List, Optional
from datetime import date, datetime
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import extract, func, or_
from app.core.database import get_db
from app.models.membro import Membro
from app.models.setor import Setor, MembroSetor
from app.models.carteirinha import Carteirinha
from app.models.escala import Escala
from app.models.usuario import Usuario
from app.core.deps import get_current_user
from app.services.excel_service import generate_excel_report, generate_csv_report
from app.services.pdf_service import generate_report_pdf

router = APIRouter()

@router.get("/membros")
def relatorio_membros(
    tipo: str = Query("ativos", description="ativos, afastados, aniversariantes, batismos, novos, congregacao, setor"),
    mes: Optional[int] = Query(None, description="Mês 1-12 para aniversariantes ou batismos"),
    congregacao: Optional[str] = None,
    setor_id: Optional[int] = None,
    formato: str = Query("json", description="json, pdf, excel, csv"),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    query = db.query(Membro)

    title = "Relatório de Membros"

    if tipo == "ativos":
        title = "Relatório de Membros Ativos"
        query = query.filter(Membro.situacao == "Ativo")
    elif tipo == "afastados":
        title = "Relatório de Membros Afastados / Inativos"
        query = query.filter(Membro.situacao.in_(["Afastado", "Inativo"]))
    elif tipo == "aniversariantes":
        title = f"Relatório de Aniversariantes (Mês: {mes or 'Todos'})"
        if mes:
            query = query.filter(extract('month', Membro.data_nascimento) == mes)
        query = query.order_by(extract('day', Membro.data_nascimento).asc())
    elif tipo == "batismos":
        title = "Relatório de Membros Batizados"
        query = query.filter(Membro.data_batismo.isnot(None))
    elif tipo == "novos":
        title = "Relatório de Novos Membros (Últimos 90 Dias)"
        dt_limite = date.today() - timedelta(days=90)
        query = query.filter(or_(Membro.data_membro >= dt_limite, Membro.created_at >= dt_limite))

    if congregacao:
        query = query.filter(Membro.congregacao.ilike(f"%{congregacao}%"))
    if setor_id:
        query = query.join(MembroSetor).filter(MembroSetor.setor_id == setor_id)

    membros = query.all()

    if formato == "json":
        return [
            {
                "id": m.id,
                "nome": m.nome,
                "cpf": m.cpf or "-",
                "telefone": m.telefone or m.whatsapp or "-",
                "congregacao": m.congregacao or "Sede",
                "situacao": m.situacao,
                "data_nascimento": m.data_nascimento.strftime("%d/%m/%Y") if m.data_nascimento else "-",
                "data_batismo": m.data_batismo.strftime("%d/%m/%Y") if m.data_batismo else "-"
            }
            for m in membros
        ]

    headers = ["ID", "Nome", "CPF", "Telefone/WhatsApp", "Congregação", "Situação", "Data Nasc.", "Batismo"]
    rows = [
        [
            str(m.id),
            m.nome,
            m.cpf or "-",
            m.telefone or m.whatsapp or "-",
            m.congregacao or "Sede",
            m.situacao,
            m.data_nascimento.strftime("%d/%m/%Y") if m.data_nascimento else "-",
            m.data_batismo.strftime("%d/%m/%Y") if m.data_batismo else "-"
        ]
        for m in membros
    ]

    filename_base = f"relatorio_membros_{tipo}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

    if formato == "excel":
        url = generate_excel_report(title, headers, rows, f"{filename_base}.xlsx")
        return {"url": url}
    elif formato == "csv":
        url = generate_csv_report(headers, rows, f"{filename_base}.csv")
        return {"url": url}
    elif formato == "pdf":
        url = generate_report_pdf(title, headers, rows, f"{filename_base}.pdf")
        return {"url": url}
    else:
        raise HTTPException(status_code=400, detail="Formato de exportação inválido")
