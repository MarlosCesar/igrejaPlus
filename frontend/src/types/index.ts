export interface Usuario {
  id: number;
  nome: string;
  login: string;
  nivel: 'Administrador' | 'Secretário' | 'Pastor' | 'Líder' | 'Consulta';
  ativo: boolean;
  created_at: string;
}

export interface SetorSimple {
  id: number;
  nome: string;
  funcao?: string;
}

export interface Membro {
  id: number;
  nome: string;
  cpf?: string;
  rg?: string;
  data_nascimento?: string;
  sexo?: string;
  estado_civil?: string;
  telefone?: string;
  whatsapp?: string;
  email?: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  data_batismo?: string;
  data_conversao?: string;
  data_membro?: string;
  congregacao?: string;
  cargo?: string;
  situacao: 'Ativo' | 'Inativo' | 'Afastado' | 'Visitante';
  observacoes?: string;
  foto?: string;
  created_at: string;
  updated_at: string;
  setores?: SetorSimple[];
}

export interface Setor {
  id: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
  membros_count: number;
}

export interface EscalaItem {
  id: number;
  escala_id: number;
  membro_id: number;
  setor_id: number;
  funcao?: string;
  membro_nome?: string;
  membro_foto?: string;
  setor_nome?: string;
}

export interface Escala {
  id: number;
  titulo: string;
  tipo_escala?: 'GERAL' | 'EBI';
  mes_ano?: string;
  data: string;
  horario: string;
  culto: string;
  observacoes?: string;
  dados_matriz?: string;
  created_at: string;
  itens: EscalaItem[];
}

export interface Carteirinha {
  id: number;
  membro_id: number;
  numero: string;
  emissao: string;
  validade: string;
  qr_code?: string;
  status: 'Ativa' | 'Vencida' | 'Cancelada';
  membro_nome?: string;
  membro_foto?: string;
  congregacao?: string;
}

export interface AuditLog {
  id: number;
  usuario_id?: number;
  usuario_nome?: string;
  acao: string;
  tabela: string;
  registro_id?: number;
  detalhes?: string;
  ip?: string;
  created_at: string;
}

export interface Configuracao {
  id: number;
  nome_igreja: string;
  cnpj?: string;
  pastor_presidente?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  site?: string;
  instagram?: string;
  facebook?: string;
  logo?: string;
}

export interface DashboardStats {
  total_membros: number;
  novos_membros_mes: number;
  total_batismos: number;
  aniversariantes_mes: number;
  proximas_escalas_count: number;
  usuarios_online_count: number;
  membros_por_situacao: { situacao: string; quantidade: number }[];
  membros_por_setor: { setor: string; quantidade: number }[];
  aniversariantes_lista: { id: number; nome: string; dia: number; foto?: string; congregacao?: string }[];
  proximas_escalas_lista: { id: number; titulo: string; data: string; horario: string; culto: string; total_integrantes: number }[];
}

export interface SearchResult {
  id: number;
  tipo: 'membro' | 'setor' | 'carteirinha';
  titulo: string;
  subtitulo: string;
  detalhe?: string;
}
