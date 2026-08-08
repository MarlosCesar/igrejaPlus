import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Users, UserPlus, Filter, Search, Edit, Trash2, Camera, Eye, Upload, FileText, Check, Loader2, Music, Mail, MessageCircle, Phone, MapPin, Calendar, ShieldCheck, Navigation
} from 'lucide-react';
import api from '../services/api';
import { Membro, Setor } from '../types';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { formatDateBR } from '../utils/formatters';

export const Membros: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [membros, setMembros] = useState<Membro[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [filtroNome, setFiltroNome] = useState(searchParams.get('search') || '');
  const [filtroCpf, setFiltroCpf] = useState('');
  const [filtroTelefone, setFiltroTelefone] = useState('');
  const [filtroSituacao, setFiltroSituacao] = useState('');
  const [filtroCargo, setFiltroCargo] = useState('');
  const [filtroSetor, setFiltroSetor] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPhoneCallSelectorOpen, setIsPhoneCallSelectorOpen] = useState(false);
  const [selectedMembro, setSelectedMembro] = useState<Membro | null>(null);

  // Lote e Quadra toggle state
  const [isLtQd, setIsLtQd] = useState(false);
  const [lote, setLote] = useState('');
  const [quadra, setQuadra] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    rg: '',
    data_nascimento: '',
    sexo: 'Masculino',
    estado_civil: 'Solteiro(a)',
    telefone: '',
    whatsapp: '',
    email: '',
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    data_batismo: '',
    data_conversao: '',
    data_membro: '',
    congregacao: 'Jardim Primavera',
    cargo: 'Membro',
    situacao: 'Ativo',
    observacoes: '',
    setor_ids: [] as number[],
    instrumentos: [] as string[],
  });

  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);

  const { user } = useAuth();
  const canEdit = ['Administrador', 'Secretário', 'Pastor'].includes(user?.user_nivel || '');

  const instrumentosOpcoes = [
    'Teclado',
    'Bateria',
    'Guitarra / Violão',
    'Baixo'
  ];

  const buscarCep = async (cepStr: string) => {
    const cleanCep = cepStr.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      try {
        setLoadingCep(true);
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setFormData((prev) => ({
            ...prev,
            cep: data.cep || cepStr,
            endereco: data.logradouro || prev.endereco,
            bairro: data.bairro || prev.bairro,
            cidade: data.localidade || prev.cidade,
            estado: data.uf || prev.estado,
          }));
        }
      } catch (e) {
        console.error('Erro ao buscar CEP no ViaCEP', e);
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => ({ ...prev, cep: val }));
    const cleanCep = val.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      buscarCep(val);
    }
  };

  useEffect(() => {
    fetchMembros();
    fetchSetores();
  }, [filtroNome, filtroCpf, filtroTelefone, filtroSituacao, filtroCargo, filtroSetor]);

  const fetchMembros = async () => {
    setLoading(true);
    try {
      const res = await api.get('/membros', {
        params: {
          nome: filtroNome || undefined,
          cpf: filtroCpf || undefined,
          telefone: filtroTelefone || undefined,
          situacao: filtroSituacao || undefined,
          cargo: filtroCargo || undefined,
          setor_id: filtroSetor || undefined,
        },
      });
      setMembros(res.data);
    } catch (err) {
      console.error('Erro ao buscar membros', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSetores = async () => {
    try {
      const res = await api.get('/setores');
      setSetores(res.data);
    } catch (err) {
      console.error('Erro ao buscar setores', err);
    }
  };

  const getFotoUrl = (url?: string | null) => {
    if (!url) return null;
    if (url.startsWith('blob:') || url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const backendUrl = api.defaults.baseURL ? api.defaults.baseURL.replace('/api/v1', '') : 'http://127.0.0.1:8000';
    return `${backendUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const handleOpenAddModal = () => {
    setSelectedMembro(null);
    setIsLtQd(false);
    setLote('');
    setQuadra('');
    setFormData({
      nome: '',
      cpf: '',
      rg: '',
      data_nascimento: '',
      sexo: 'Masculino',
      estado_civil: 'Solteiro(a)',
      telefone: '',
      whatsapp: '',
      email: '',
      cep: '',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      data_batismo: '',
      data_conversao: '',
      data_membro: '',
      congregacao: 'Jardim Primavera',
      cargo: 'Membro',
      situacao: 'Ativo',
      observacoes: '',
      setor_ids: [],
      instrumentos: [],
    });
    setFotoFile(null);
    setFotoPreview(null);
    setImageError(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (membro: Membro) => {
    setSelectedMembro(membro);

    let instList: string[] = [];
    if (membro.observacoes && membro.observacoes.includes('[Instrumentos:')) {
      const match = membro.observacoes.match(/\[Instrumentos:\s*([^\]]+)\]/);
      if (match && match[1]) {
        instList = match[1].split(',').map((s) => s.trim());
      }
    }

    // Parse Lt e Qd from numero if present
    const numStr = membro.numero || '';
    if (numStr.includes('Lt') || numStr.includes('Qd')) {
      setIsLtQd(true);
      const ltMatch = numStr.match(/Lt:?\s*([^\sQd]+)/i);
      const qdMatch = numStr.match(/Qd:?\s*([^\s]+)/i);
      setLote(ltMatch ? ltMatch[1] : '');
      setQuadra(qdMatch ? qdMatch[1] : '');
    } else {
      setIsLtQd(false);
      setLote('');
      setQuadra('');
    }

    setFormData({
      nome: membro.nome,
      cpf: membro.cpf || '',
      rg: membro.rg || '',
      data_nascimento: membro.data_nascimento || '',
      sexo: membro.sexo || 'Masculino',
      estado_civil: membro.estado_civil || 'Solteiro(a)',
      telefone: membro.telefone || '',
      whatsapp: membro.whatsapp || '',
      email: membro.email || '',
      cep: membro.cep || '',
      endereco: membro.endereco || '',
      numero: numStr,
      complemento: membro.complemento || '',
      bairro: membro.bairro || '',
      cidade: membro.cidade || '',
      estado: membro.estado || '',
      data_batismo: membro.data_batismo || '',
      data_conversao: membro.data_conversao || '',
      data_membro: membro.data_membro || '',
      congregacao: membro.congregacao || 'Jardim Primavera',
      cargo: membro.cargo || 'Membro',
      situacao: membro.situacao || 'Ativo',
      observacoes: membro.observacoes ? membro.observacoes.replace(/\[Instrumentos:[^\]]+\]/, '').trim() : '',
      setor_ids: membro.setores?.map((s) => s.id) || [],
      instrumentos: instList,
    });
    setFotoFile(null);
    setFotoPreview(getFotoUrl(membro.foto));
    setImageError(false);
    setIsModalOpen(true);
  };

  const handleToggleSetor = (id: number) => {
    setFormData((prev) => {
      const exists = prev.setor_ids.includes(id);
      return {
        ...prev,
        setor_ids: exists ? prev.setor_ids.filter((sId) => sId !== id) : [...prev.setor_ids, id],
      };
    });
  };

  const handleToggleInstrumento = (inst: string) => {
    setFormData((prev) => {
      const exists = prev.instrumentos.includes(inst);
      return {
        ...prev,
        instrumentos: exists ? prev.instrumentos.filter((i) => i !== inst) : [...prev.instrumentos, inst],
      };
    });
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFotoFile(file);
      setFotoPreview(URL.createObjectURL(file));
      setImageError(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let finalNumero = formData.numero;
      if (isLtQd) {
        finalNumero = `Lt: ${lote.trim()} Qd: ${quadra.trim()}`.trim();
      }

      let finalObs = formData.observacoes;
      if (formData.instrumentos.length > 0) {
        finalObs = `${finalObs} [Instrumentos: ${formData.instrumentos.join(', ')}]`.trim();
      }

      const payload: any = {
        ...formData,
        data_nascimento: formData.data_nascimento || null,
        data_batismo: formData.data_batismo || null,
        data_conversao: formData.data_conversao || null,
        data_membro: formData.data_membro || null,
        numero: finalNumero,
        observacoes: finalObs,
      };
      delete payload.instrumentos;

      let membroId = selectedMembro?.id;

      if (selectedMembro) {
        await api.put(`/membros/${selectedMembro.id}`, payload);
      } else {
        const res = await api.post('/membros', payload);
        membroId = res.data.id;
      }

      if (fotoFile && membroId) {
        const formDataFoto = new FormData();
        formDataFoto.append('file', fotoFile);
        formDataFoto.append('foto', fotoFile);
        await api.post(`/membros/${membroId}/foto`, formDataFoto, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setIsModalOpen(false);
      fetchMembros();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Erro ao salvar membro');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja inativar este membro?')) return;
    try {
      await api.delete(`/membros/${id}`);
      setIsDetailOpen(false);
      fetchMembros();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Erro ao inativar membro');
    }
  };

  // Communication & Location Actions
  const handleSendEmail = (emailStr?: string) => {
    if (!emailStr) {
      alert('Este membro não possui e-mail cadastrado.');
      return;
    }
    window.open(`mailto:${emailStr}`, '_blank');
  };

  const handleSendWhatsapp = (whatsAppStr?: string) => {
    if (!whatsAppStr) {
      alert('Este membro não possui WhatsApp cadastrado.');
      return;
    }
    const cleanNum = whatsAppStr.replace(/\D/g, '');
    const numWith55 = cleanNum.startsWith('55') ? cleanNum : `55${cleanNum}`;
    window.open(`https://wa.me/${numWith55}`, '_blank');
  };

  const handlePhoneCallInit = () => {
    if (!selectedMembro) return;
    const tel = selectedMembro.telefone?.trim();
    const whats = selectedMembro.whatsapp?.trim();

    if (!tel && !whats) {
      alert('Este membro não possui nenhum telefone ou WhatsApp cadastrado.');
      return;
    }

    if (tel && whats && tel !== whats) {
      setIsPhoneCallSelectorOpen(true);
    } else {
      const numToCall = tel || whats;
      makeCall(numToCall!);
    }
  };

  const makeCall = (numberStr: string) => {
    const cleanNum = numberStr.replace(/\D/g, '');
    window.location.href = `tel:${cleanNum}`;
    setIsPhoneCallSelectorOpen(false);
  };

  const handleOpenLocation = () => {
    if (!selectedMembro) return;

    const street = selectedMembro.endereco?.trim() || '';
    const num = selectedMembro.numero?.trim() || '';
    const neighborhood = selectedMembro.bairro?.trim() || '';
    const city = selectedMembro.cidade?.trim() || '';
    const state = selectedMembro.estado?.trim() || '';
    const cep = selectedMembro.cep?.trim() || '';

    // If member has no street and no CEP registered, warn user
    if (!street && !cep && !neighborhood) {
      alert('Este membro ainda não possui endereço ou CEP cadastrado. Por favor, edite o cadastro e preencha a seção de Endereço Residencial.');
      return;
    }

    // Build precise Google Maps location query string
    const addressParts = [];
    if (street) {
      addressParts.push(num ? `${street}, ${num}` : street);
    }
    if (neighborhood) addressParts.push(neighborhood);
    if (city || state) addressParts.push(`${city || 'Duque de Caxias'} - ${state || 'RJ'}`);
    if (cep) addressParts.push(`CEP ${cep}`);

    const queryStr = addressParts.join(', ');
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryStr)}`, '_blank');
  };

  const isMusicoSelected = setores.some((s) => s.nome.toLowerCase() === 'músico' && formData.setor_ids.includes(s.id));

  const inputClass = "w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all";

  const isMembroRole = user?.user_nivel === 'Membro';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center space-x-2">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-500" />
            <span>{isMembroRole ? 'Meu Cadastro de Membro' : 'Gestão de Membros'}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isMembroRole ? 'Visualização e atualização dos seus dados cadastrais' : 'Cadastro centralizado e gerenciamento de membros da igreja'}
          </p>
        </div>

        {canEdit && !isMembroRole && (
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/25 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Cadastrar Membro</span>
          </button>
        )}
      </div>

      {/* Filters Card - Hidden for Membro role */}
      {!isMembroRole && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Filtros de Busca Avançada</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <input
            type="text"
            placeholder="Nome do membro..."
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
            className={inputClass}
          />
          <input
            type="text"
            placeholder="CPF..."
            value={filtroCpf}
            onChange={(e) => setFiltroCpf(e.target.value)}
            className={inputClass}
          />
          <input
            type="text"
            placeholder="Telefone..."
            value={filtroTelefone}
            onChange={(e) => setFiltroTelefone(e.target.value)}
            className={inputClass}
          />
          <select
            value={filtroCargo}
            onChange={(e) => setFiltroCargo(e.target.value)}
            className={inputClass}
          >
            <option value="">Todos os Cargos</option>
            <option value="Membro">Membro</option>
            <option value="Diácono">Diácono</option>
            <option value="Missionário">Missionário</option>
            <option value="Pastor">Pastor</option>
            <option value="Obreiro">Obreiro</option>
            <option value="Bispo">Bispo</option>
          </select>
          <select
            value={filtroSituacao}
            onChange={(e) => setFiltroSituacao(e.target.value)}
            className={inputClass}
          >
            <option value="">Todas as Situações</option>
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
            <option value="Afastado">Afastado</option>
            <option value="Visitante">Visitante</option>
          </select>
          <select
            value={filtroSetor}
            onChange={(e) => setFiltroSetor(e.target.value)}
            className={inputClass}
          >
            <option value="">Todos os Setores</option>
            {setores.map((s) => (
              <option key={s.id} value={s.id}>{s.nome}</option>
            ))}
          </select>
        </div>
      </div>
      )}

      {/* Table Section */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : membros.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Nenhum membro encontrado com os filtros selecionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Membro</th>
                  <th className="p-3">Cargo / Situação</th>
                  <th className="p-3">Contato / WhatsApp</th>
                  <th className="p-3">Congregação</th>
                  <th className="p-3">Setores / Ministérios</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {membros.map((membro) => (
                  <tr key={membro.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-300 dark:border-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 text-xs">
                          {membro.foto && !imageError ? (
                            <img
                              src={getFotoUrl(membro.foto) || ''}
                              alt={membro.nome}
                              onError={() => setImageError(true)}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            membro.nome.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">{membro.nome}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">CPF: {membro.cpf || 'Não informado'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="space-y-1">
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          {membro.cargo || 'Membro'}
                        </span>
                        <div>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            membro.situacao === 'Ativo' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600'
                          }`}>
                            {membro.situacao}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">
                      <p>{membro.telefone || membro.whatsapp || '-'}</p>
                      <p className="text-[10px] text-slate-400">{membro.email || ''}</p>
                    </td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">{membro.congregacao || 'Jardim Primavera'}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {membro.setores && membro.setores.length > 0 ? (
                          membro.setores.map((s) => (
                            <span key={s.id} className="text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">
                              {s.nome}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Nenhum</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => { setSelectedMembro(membro); setIsDetailOpen(true); }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Ver Detalhes da Ficha"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canEdit && (
                          <>
                            <button
                              onClick={() => handleOpenEditModal(membro)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(membro.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="Inativar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Cadastro / Edição de Membro */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedMembro ? 'Editar Cadastro de Membro' : 'Novo Cadastro de Membro'}
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Foto Upload Header */}
          <div className="flex items-center space-x-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="relative w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 overflow-hidden shrink-0 flex items-center justify-center font-bold text-slate-500 text-lg">
              {fotoPreview && !imageError ? (
                <img
                  src={fotoPreview}
                  alt="Foto de Identificação"
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Users className="w-8 h-8 text-slate-400" />
              )}
              <label className="absolute inset-0 bg-slate-950/60 opacity-0 hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-white">
                <Camera className="w-5 h-5" />
                <input type="file" accept="image/*" onChange={handleFotoChange} className="hidden" />
              </label>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Foto de Identificação</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Clique na imagem para enviar foto oficial do membro (utilizada nas carteirinhas)</p>
            </div>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome Completo *</label>
              <input
                type="text"
                required
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">CPF</label>
              <input
                type="text"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                placeholder="000.000.000-00"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">RG</label>
              <input
                type="text"
                value={formData.rg}
                onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Data de Nascimento</label>
              <input
                type="date"
                value={formData.data_nascimento}
                onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Sexo</label>
              <select
                value={formData.sexo}
                onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
                className={inputClass}
              >
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Estado Civil</label>
              <select
                value={formData.estado_civil}
                onChange={(e) => setFormData({ ...formData, estado_civil: e.target.value })}
                className={inputClass}
              >
                <option value="Solteiro(a)">Solteiro(a)</option>
                <option value="Casado(a)">Casado(a)</option>
                <option value="Divorciado(a)">Divorciado(a)</option>
                <option value="Viúvo(a)">Viúvo(a)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Telefone</label>
              <input
                type="text"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">WhatsApp</label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Congregação</label>
              <input
                type="text"
                value={formData.congregacao}
                onChange={(e) => setFormData({ ...formData, congregacao: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Cargo Eclesiástico *</label>
              <select
                value={formData.cargo}
                onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                className={inputClass}
              >
                <option value="Membro">Membro</option>
                <option value="Diácono">Diácono / Diáconisa</option>
                <option value="Missionário">Missionário(a)</option>
                <option value="Pastor">Pastor(a)</option>
                <option value="Obreiro">Obreiro(a)</option>
                <option value="Bispo">Bispo</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Situação</label>
              <select
                value={formData.situacao}
                onChange={(e) => setFormData({ ...formData, situacao: e.target.value })}
                className={inputClass}
              >
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
                <option value="Afastado">Afastado</option>
                <option value="Visitante">Visitante</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Data de Batismo</label>
              <input
                type="date"
                value={formData.data_batismo}
                onChange={(e) => setFormData({ ...formData, data_batismo: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Data de Conversão</label>
              <input
                type="date"
                value={formData.data_conversao}
                onChange={(e) => setFormData({ ...formData, data_conversao: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Data de Admissão como Membro</label>
              <input
                type="date"
                value={formData.data_membro}
                onChange={(e) => setFormData({ ...formData, data_membro: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          {/* Endereço Completo com Chave Lt e Qd */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Endereço Residencial</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1 flex items-center justify-between">
                  <span>CEP</span>
                  {loadingCep && <Loader2 className="w-3 h-3 text-blue-600 animate-spin" />}
                </label>
                <input
                  type="text"
                  placeholder="00000-000"
                  value={formData.cep}
                  onChange={handleCepChange}
                  onBlur={() => buscarCep(formData.cep)}
                  className={inputClass}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] text-slate-500 mb-1">Logradouro / Rua</label>
                <input
                  type="text"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] text-slate-500 font-semibold">
                    {isLtQd ? 'Lote (Lt) & Quadra (Qd)' : 'Número / Comp.'}
                  </label>
                  <label className="inline-flex items-center space-x-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isLtQd}
                      onChange={(e) => setIsLtQd(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3 h-3"
                    />
                    <span>Lt e Qd?</span>
                  </label>
                </div>

                {isLtQd ? (
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="text"
                      placeholder="Lote (Lt)"
                      value={lote}
                      onChange={(e) => setLote(e.target.value)}
                      className={inputClass}
                    />
                    <input
                      type="text"
                      placeholder="Quadra (Qd)"
                      value={quadra}
                      onChange={(e) => setQuadra(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                ) : (
                  <input
                    type="text"
                    placeholder="Ex: 483 ou Ap 101"
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    className={inputClass}
                  />
                )}
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Bairro</label>
                <input
                  type="text"
                  value={formData.bairro}
                  onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Cidade</label>
                <input
                  type="text"
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Estado (UF)</label>
                <input
                  type="text"
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Setores Multiselect Pills */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Setores / Ministérios que participa
            </label>
            <div className="flex flex-wrap gap-2">
              {setores.map((setor) => {
                const selected = formData.setor_ids.includes(setor.id);
                return (
                  <button
                    key={setor.id}
                    type="button"
                    onClick={() => handleToggleSetor(setor.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                      selected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {setor.nome}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sub-Seleção de Instrumentos caso "Músico" esteja selecionado */}
          {isMusicoSelected && (
            <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/50 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center space-x-2 text-xs font-bold text-blue-700 dark:text-blue-400">
                <Music className="w-4 h-4" />
                <span>Quais instrumentos este músico toca? *</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {instrumentosOpcoes.map((inst) => {
                  const selected = formData.instrumentos.includes(inst);
                  return (
                    <button
                      key={inst}
                      type="button"
                      onClick={() => handleToggleInstrumento(inst)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border ${
                        selected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {selected ? '✓ ' : ''}{inst}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-600/25"
            >
              Salvar Membro
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal COMPLETO: Ficha do Membro */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={`Ficha Oficial do Membro`}
        maxWidth="max-w-3xl"
      >
        {selectedMembro && (
          <div className="space-y-6">
            {/* Header Profile Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 overflow-hidden flex items-center justify-center font-bold text-slate-600 text-2xl shrink-0 shadow-sm">
                {selectedMembro.foto && !imageError ? (
                  <img
                    src={getFotoUrl(selectedMembro.foto) || ''}
                    alt=""
                    onError={() => setImageError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  selectedMembro.nome.charAt(0)
                )}
              </div>
              <div className="text-center sm:text-left space-y-1 flex-1">
                <div className="flex items-center justify-center sm:justify-start space-x-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{selectedMembro.nome}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedMembro.situacao === 'Ativo' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                  }`}>
                    {selectedMembro.situacao}
                  </span>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-bold">{selectedMembro.cargo || 'Membro'}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center sm:justify-start space-x-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Congregação: {selectedMembro.congregacao || 'Jardim Primavera'}</span>
                </p>
              </div>
            </div>

            {/* Structured Details Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Box 1: Dados Pessoais */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-sm">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center space-x-1.5">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Dados Pessoais</span>
                </h4>
                <div className="space-y-1.5 text-slate-700 dark:text-slate-300">
                  <p><span className="font-semibold text-slate-400">CPF:</span> {selectedMembro.cpf || 'Não informado'}</p>
                  <p><span className="font-semibold text-slate-400">RG:</span> {selectedMembro.rg || 'Não informado'}</p>
                  <p><span className="font-semibold text-slate-400">Nascimento:</span> {formatDateBR(selectedMembro.data_nascimento)}</p>
                  <p><span className="font-semibold text-slate-400">Sexo:</span> {selectedMembro.sexo || 'Não informado'}</p>
                  <p><span className="font-semibold text-slate-400">Estado Civil:</span> {selectedMembro.estado_civil || 'Não informado'}</p>
                </div>
              </div>

              {/* Box 2: Contato & Comunicação */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-sm">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center space-x-1.5">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>Contato & Comunicação</span>
                </h4>
                <div className="space-y-1.5 text-slate-700 dark:text-slate-300">
                  <p><span className="font-semibold text-slate-400">Telefone:</span> {selectedMembro.telefone || 'Não informado'}</p>
                  <p><span className="font-semibold text-slate-400">WhatsApp:</span> {selectedMembro.whatsapp || 'Não informado'}</p>
                  <p><span className="font-semibold text-slate-400">E-mail:</span> {selectedMembro.email || 'Não informado'}</p>
                </div>
              </div>

              {/* Box 3: Dados Eclesiásticos */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-sm">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Dados Eclesiásticos</span>
                </h4>
                <div className="space-y-1.5 text-slate-700 dark:text-slate-300">
                  <p><span className="font-semibold text-slate-400">Cargo Eclesiástico:</span> {selectedMembro.cargo || 'Membro'}</p>
                  <p><span className="font-semibold text-slate-400">Situação:</span> {selectedMembro.situacao || 'Ativo'}</p>
                  <p><span className="font-semibold text-slate-400">Data de Batismo:</span> {formatDateBR(selectedMembro.data_batismo)}</p>
                  <p><span className="font-semibold text-slate-400">Data de Conversão:</span> {formatDateBR(selectedMembro.data_conversao)}</p>
                  <p><span className="font-semibold text-slate-400">Data Admissão Membro:</span> {formatDateBR(selectedMembro.data_membro)}</p>
                </div>
              </div>

              {/* Box 4: Endereço Residencial */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-sm">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center space-x-1.5">
                  <MapPin className="w-4 h-4 text-purple-600" />
                  <span>Endereço Residencial</span>
                </h4>
                <div className="space-y-1.5 text-slate-700 dark:text-slate-300">
                  <p><span className="font-semibold text-slate-400">Logradouro:</span> {selectedMembro.endereco ? `${selectedMembro.endereco}, ${selectedMembro.numero || 'S/N'}` : 'Não informado'}</p>
                  <p><span className="font-semibold text-slate-400">Bairro:</span> {selectedMembro.bairro || 'Não informado'}</p>
                  <p><span className="font-semibold text-slate-400">Cidade / UF:</span> {selectedMembro.cidade ? `${selectedMembro.cidade} / ${selectedMembro.estado || 'RJ'}` : 'Não informado'}</p>
                  <p><span className="font-semibold text-slate-400">CEP:</span> {selectedMembro.cep || 'Não informado'}</p>
                </div>
              </div>
            </div>

            {/* Setores & Ministérios */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
              <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">Setores & Ministérios Integrados</h4>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedMembro.setores && selectedMembro.setores.length > 0 ? (
                  selectedMembro.setores.map((s) => (
                    <span key={s.id} className="text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-xl border border-blue-500/20">
                      {s.nome}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">Nenhum setor associado</span>
                )}
              </div>

              {selectedMembro.observacoes && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-bold text-slate-900 dark:text-slate-100">Observações: </span>
                  {selectedMembro.observacoes}
                </div>
              )}
            </div>

            {/* ACTION BUTTONS FOOTER: E-mail, WhatsApp, Ligar, Localização, Editar, Excluir */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {/* Botão WhatsApp */}
                <button
                  type="button"
                  onClick={() => handleSendWhatsapp(selectedMembro.whatsapp || selectedMembro.telefone)}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </button>

                {/* Botão E-mail */}
                <button
                  type="button"
                  onClick={() => handleSendEmail(selectedMembro.email)}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all"
                >
                  <Mail className="w-4 h-4" />
                  <span>Enviar E-mail</span>
                </button>

                {/* Botão Ligar */}
                <button
                  type="button"
                  onClick={handlePhoneCallInit}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all"
                >
                  <Phone className="w-4 h-4" />
                  <span>Ligar</span>
                </button>

                {/* Botão Localização (Google Maps) */}
                <button
                  type="button"
                  onClick={handleOpenLocation}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md shadow-purple-600/20 transition-all"
                  title="Abrir no Google Maps"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Localização</span>
                </button>
              </div>

              {canEdit && (
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => { setIsDetailOpen(false); handleOpenEditModal(selectedMembro); }}
                    className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-md shadow-amber-600/20 transition-all"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Editar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(selectedMembro.id)}
                    className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md shadow-rose-600/20 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Excluir</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Seletor de Chamada Telefônica caso tenha mais de 1 número */}
      <Modal
        isOpen={isPhoneCallSelectorOpen}
        onClose={() => setIsPhoneCallSelectorOpen(false)}
        title="Para qual número deseja ligar?"
      >
        {selectedMembro && (
          <div className="space-y-4 py-2">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              O membro <strong>{selectedMembro.nome}</strong> possui 2 números cadastrados. Escolha para qual deseja discar:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedMembro.telefone && (
                <button
                  type="button"
                  onClick={() => makeCall(selectedMembro.telefone!)}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-500/10 text-left space-y-1 transition-all group"
                >
                  <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                    <Phone className="w-4 h-4" />
                    <span>Telefone Fixo / Celular</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{selectedMembro.telefone}</p>
                </button>
              )}

              {selectedMembro.whatsapp && (
                <button
                  type="button"
                  onClick={() => makeCall(selectedMembro.whatsapp!)}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:bg-emerald-500/10 text-left space-y-1 transition-all group"
                >
                  <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                    <MessageCircle className="w-4 h-4" />
                    <span>Número WhatsApp</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{selectedMembro.whatsapp}</p>
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
