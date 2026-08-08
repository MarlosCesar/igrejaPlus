from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Any
from datetime import datetime, date

class AuditLogResponse(BaseModel):
    id: int
    usuario_id: Optional[int] = None
    usuario_nome: Optional[str] = None
    acao: str
    tabela: str
    registro_id: Optional[int] = None
    detalhes: Optional[str] = None
    ip: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ConfiguracaoBase(BaseModel):
    nome_igreja: str = "Igreja Evangelica Igreja+"
    cnpj: Optional[str] = None
    pastor_presidente: Optional[str] = None
    endereco: Optional[str] = None
    telefone: Optional[str] = None
    email: Optional[str] = None
    site: Optional[str] = None
    instagram: Optional[str] = None
    facebook: Optional[str] = None
    logo: Optional[str] = None

class ConfiguracaoUpdate(ConfiguracaoBase):
    pass

class ConfiguracaoResponse(ConfiguracaoBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

class DashboardStatsResponse(BaseModel):
    total_membros: int
    novos_membros_mes: int
    total_batismos: int
    aniversariantes_mes: int
    proximas_escalas_count: int
    usuarios_online_count: int
    membros_por_situacao: List[dict]
    membros_por_setor: List[dict]
    aniversariantes_lista: List[dict]
    proximas_escalas_lista: List[dict]

class SearchResultItem(BaseModel):
    id: int
    tipo: str # "membro", "setor", "carteirinha"
    titulo: str
    subtitulo: str
    detalhe: Optional[str] = None
