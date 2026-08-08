from datetime import date, datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from app.core.database import get_db
from app.models.membro import Membro
from app.models.setor import Setor, MembroSetor
from app.models.escala import Escala
from app.models.usuario import Usuario
from app.schemas.system import DashboardStatsResponse
from app.core.deps import get_current_user

router = APIRouter()

@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    hoje = date.today()
    mes_atual = hoje.month
    ano_atual = hoje.year

    total_membros = db.query(func.count(Membro.id)).scalar() or 0

    dt_inicio_mes = date(ano_atual, mes_atual, 1)
    novos_membros_mes = db.query(func.count(Membro.id)).filter(Membro.created_at >= dt_inicio_mes).scalar() or 0

    total_batismos = db.query(func.count(Membro.id)).filter(Membro.data_batismo.isnot(None)).scalar() or 0

    aniversariantes_mes = db.query(func.count(Membro.id)).filter(extract('month', Membro.data_nascimento) == mes_atual).scalar() or 0

    proximas_escalas_count = db.query(func.count(Escala.id)).filter(Escala.data >= hoje).scalar() or 0

    usuarios_online_count = db.query(func.count(Usuario.id)).filter(Usuario.ativo == True).scalar() or 1

    # Membros por situação
    situacoes_rows = db.query(Membro.situacao, func.count(Membro.id)).group_by(Membro.situacao).all()
    membros_por_situacao = [{"situacao": s or "Ativo", "quantidade": qty} for s, qty in situacoes_rows]

    # Membros por setor
    setores_rows = db.query(Setor.nome, func.count(MembroSetor.id)).join(MembroSetor, Setor.id == MembroSetor.setor_id).group_by(Setor.nome).all()
    membros_por_setor = [{"setor": s, "quantidade": qty} for s, qty in setores_rows]

    # Aniversariantes lista do mês (top 5 próximos)
    aniversariantes = db.query(Membro).filter(extract('month', Membro.data_nascimento) == mes_atual).order_by(extract('day', Membro.data_nascimento).asc()).limit(8).all()
    aniversariantes_lista = [
        {
            "id": m.id,
            "nome": m.nome,
            "dia": m.data_nascimento.day if m.data_nascimento else "-",
            "foto": m.foto,
            "congregacao": m.congregacao or "Sede"
        }
        for m in aniversariantes
    ]

    # Próximas escalas lista
    escalas_proximas = db.query(Escala).filter(Escala.data >= hoje).order_by(Escala.data.asc()).limit(5).all()
    proximas_escalas_lista = [
        {
            "id": e.id,
            "titulo": e.titulo,
            "data": e.data.strftime("%d/%m/%Y"),
            "horario": e.horario,
            "culto": e.culto,
            "total_integrantes": len(e.itens)
        }
        for e in escalas_proximas
    ]

    return DashboardStatsResponse(
        total_membros=total_membros,
        novos_membros_mes=novos_membros_mes,
        total_batismos=total_batismos,
        aniversariantes_mes=aniversariantes_mes,
        proximas_escalas_count=proximas_escalas_count,
        usuarios_online_count=usuarios_online_count,
        membros_por_situacao=membros_por_situacao,
        membros_por_setor=membros_por_setor,
        aniversariantes_lista=aniversariantes_lista,
        proximas_escalas_lista=proximas_escalas_lista
    )
