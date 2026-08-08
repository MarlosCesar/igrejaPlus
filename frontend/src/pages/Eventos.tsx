import React, { useState, useEffect } from 'react';
import { Calendar, Plus, MapPin, Clock, Users, CheckCircle2, FileText, Loader2, Edit, Trash2, X, Download, ShieldCheck, Sparkles } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Evento, InscricaoEvento, Membro } from '../types';
import { formatDateBR } from '../utils/formatters';

const PRESET_BANNERS = [
  {
    id: 'celebracao',
    nome: 'Culto de Celebração',
    url: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1000&q=80',
    tag: 'Celebração'
  },
  {
    id: 'mulheres',
    nome: 'Congresso de Mulheres',
    url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1000&q=80',
    tag: 'Feminino'
  },
  {
    id: 'jovens',
    nome: 'Impacto Jovem / Mocidade',
    url: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1000&q=80',
    tag: 'Jovens'
  },
  {
    id: 'ceia',
    nome: 'Santa Ceia do Senhor',
    url: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=1000&q=80',
    tag: 'Comunhão'
  },
  {
    id: 'ensino',
    nome: 'Culto de Ensino & Doutrina',
    url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1000&q=80',
    tag: 'Ensino'
  },
  {
    id: 'oracao',
    nome: 'Vigília & Reunião de Oração',
    url: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1000&q=80',
    tag: 'Oração'
  }
];

export const Eventos: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user && ['Administrador', 'Pastor', 'Secretário', 'Líder de Setor'].includes(user.user_nivel);
  const isVisitante = user?.user_nivel === 'Visitante';

  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [membroLogged, setMembroLogged] = useState<Membro | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingEvento, setEditingEvento] = useState<Evento | null>(null);
  const [selectedEventoInscricao, setSelectedEventoInscricao] = useState<Evento | null>(null);
  const [selectedEventoParticipantes, setSelectedEventoParticipantes] = useState<Evento | null>(null);

  // Event Form State
  const [eventFormData, setEventFormData] = useState({
    titulo: '',
    descricao: '',
    data_evento: '',
    hora_evento: '19:00',
    local: 'Sede Principal',
    imagem_url: PRESET_BANNERS[0].url,
    requer_inscricao: true,
    ativo: true
  });

  // Inscricao Form State
  const [inscricaoFormData, setInscricaoFormData] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
    endereco: '',
    congregacao: 'Jardim Primavera'
  });

  const [submitting, setSubmitting] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/eventos');
      setEventos(res.data);

      if (user && user.user_nivel === 'Membro') {
        const resMembro = await api.get('/membros');
        if (resMembro.data && resMembro.data.length > 0) {
          setMembroLogged(resMembro.data[0]);
        }
      }
    } catch (err) {
      console.error('Erro ao buscar eventos', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = (ev?: Evento) => {
    if (ev) {
      setEditingEvento(ev);
      setEventFormData({
        titulo: ev.titulo,
        descricao: ev.descricao || '',
        data_evento: ev.data_evento,
        hora_evento: ev.hora_evento || '19:00',
        local: ev.local || 'Sede Principal',
        imagem_url: ev.imagem_url || PRESET_BANNERS[0].url,
        requer_inscricao: ev.requer_inscricao,
        ativo: ev.ativo
      });
    } else {
      setEditingEvento(null);
      setEventFormData({
        titulo: '',
        descricao: '',
        data_evento: new Date().toISOString().split('T')[0],
        hora_evento: '19:00',
        local: 'Sede Principal',
        imagem_url: PRESET_BANNERS[0].url,
        requer_inscricao: true,
        ativo: true
      });
    }
    setIsCreateModalOpen(true);
  };

  const handleOpenInscricaoModal = (ev: Evento) => {
    setSelectedEventoInscricao(ev);

    if (isVisitante) {
      // BLANK form for visitor
      setInscricaoFormData({
        nome: '',
        cpf: '',
        telefone: '',
        email: '',
        endereco: '',
        congregacao: 'Jardim Primavera'
      });
    } else if (membroLogged) {
      // PRE-FILLED form for logged member
      setInscricaoFormData({
        nome: membroLogged.nome || user?.user_nome || '',
        cpf: membroLogged.cpf || '',
        telefone: membroLogged.telefone || membroLogged.whatsapp || '',
        email: membroLogged.email || '',
        endereco: membroLogged.endereco ? `${membroLogged.endereco}, ${membroLogged.numero || ''}` : '',
        congregacao: membroLogged.congregacao || 'Jardim Primavera'
      });
    } else {
      setInscricaoFormData({
        nome: user?.user_nome || '',
        cpf: '',
        telefone: '',
        email: '',
        endereco: '',
        congregacao: 'Jardim Primavera'
      });
    }
  };

  const handleSaveEvento = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingEvento) {
        await api.put(`/eventos/${editingEvento.id}`, eventFormData);
      } else {
        await api.post('/eventos', eventFormData);
      }
      setIsCreateModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Erro ao salvar evento');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvento = async (evId: number) => {
    if (!window.confirm('Deseja realmente excluir este evento?')) return;
    try {
      await api.delete(`/eventos/${evId}`);
      fetchData();
    } catch (err) {
      alert('Erro ao excluir evento');
    }
  };

  const handleSubmitInscricao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventoInscricao) return;
    setSubmitting(true);
    try {
      await api.post(`/eventos/${selectedEventoInscricao.id}/inscrever`, {
        evento_id: selectedEventoInscricao.id,
        ...inscricaoFormData
      });
      alert('Inscrição no evento realizada com sucesso!');
      setSelectedEventoInscricao(null);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Erro ao se inscrever no evento');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadRelatorioPdf = async (evId: number) => {
    setDownloadingPdf(true);
    try {
      const res = await api.get(`/eventos/${evId}/relatorio-pdf`);
      if (res.data.pdf_url) {
        const backendUrl = api.defaults.baseURL ? api.defaults.baseURL.replace('/api/v1', '') : 'http://127.0.0.1:8000';
        window.open(`${backendUrl}${res.data.pdf_url}`, '_blank');
      }
    } catch (err) {
      alert('Erro ao gerar relatório do evento');
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center space-x-2">
            <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-500" />
            <span>Eventos e Programação</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Agenda oficial de conferências, cultos especiais e congressos da igreja
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => handleOpenCreateModal()}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/25 transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Novo Evento</span>
          </button>
        )}
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="p-12 flex justify-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : eventos.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-xs rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          Nenhum evento cadastrado no momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {eventos.map((ev) => (
            <div
              key={ev.id}
              className={`group rounded-3xl border transition-all overflow-hidden flex flex-col justify-between ${
                ev.ativo
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl'
                  : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800/60 opacity-60'
              }`}
            >
              {/* Banner Image Header */}
              <div className="relative h-48 w-full bg-slate-950 overflow-hidden">
                <img
                  src={ev.imagem_url || PRESET_BANNERS[0].url}
                  alt={ev.titulo}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-block text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-md backdrop-blur-md ${
                      ev.ativo
                        ? 'bg-blue-600/90 text-white'
                        : 'bg-slate-800/90 text-slate-300'
                    }`}>
                      {ev.ativo ? 'Evento Ativo' : 'Encerrado / Inativo'}
                    </span>

                    {isAdmin && (
                      <div className="flex items-center space-x-1 bg-slate-950/60 backdrop-blur-md p-1 rounded-xl border border-white/10">
                        <button
                          onClick={() => handleOpenCreateModal(ev)}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-amber-400 hover:bg-white/10 transition-colors"
                          title="Editar Evento"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvento(ev.id)}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-rose-400 hover:bg-white/10 transition-colors"
                          title="Excluir Evento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xl font-extrabold text-white drop-shadow-md leading-tight">
                      {ev.titulo}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                {ev.descricao && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {ev.descricao}
                  </p>
                )}

                <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Data: <strong>{formatDateBR(ev.data_evento)}</strong></span>
                  </div>
                  {ev.hora_evento && (
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>Horário: <strong>{ev.hora_evento}</strong></span>
                    </div>
                  )}
                  {ev.local && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>Local: <strong>{ev.local}</strong></span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  {ev.requer_inscricao && ev.ativo ? (
                    <button
                      onClick={() => handleOpenInscricaoModal(ev)}
                      className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center space-x-1.5"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Preencher Ficha de Inscrição</span>
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Entrada Livre (Sem necessidade de inscrição)</span>
                  )}

                  {isAdmin && ev.requer_inscricao && (
                    <button
                      onClick={() => handleDownloadRelatorioPdf(ev.id)}
                      disabled={downloadingPdf}
                      className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-all flex items-center space-x-1"
                      title="Relatório de Participantes (PDF)"
                    >
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>PDF</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL CRIAR / EDITAR EVENTO (ADMIN) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-xl shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {editingEvento ? 'Editar Evento' : 'Cadastrar Novo Evento'}
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvento} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Título do Evento *</label>
                <input
                  type="text"
                  required
                  value={eventFormData.titulo}
                  onChange={(e) => setEventFormData({ ...eventFormData, titulo: e.target.value })}
                  placeholder="Ex: Congresso de Jovens 2026"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* BANNER SELECTION GALLERY */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Selecione um Banner / Imagem Pré-existente *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-1.5 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/50">
                  {PRESET_BANNERS.map((preset) => {
                    const isSelected = eventFormData.imagem_url === preset.url;
                    return (
                      <div
                        key={preset.id}
                        onClick={() => setEventFormData({ ...eventFormData, imagem_url: preset.url })}
                        className={`group relative h-20 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-600 ring-2 ring-blue-500/30 scale-[1.02]'
                            : 'border-transparent opacity-80 hover:opacity-100'
                        }`}
                      >
                        <img src={preset.url} alt={preset.nome} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-slate-950/50 p-1.5 flex flex-col justify-between">
                          <span className="text-[9px] font-extrabold text-white bg-blue-600/90 px-1.5 py-0.5 rounded self-start">
                            {preset.tag}
                          </span>
                          <span className="text-[10px] font-bold text-white truncate drop-shadow">
                            {preset.nome}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Ou Cole a URL da Imagem do Banner</label>
                <input
                  type="text"
                  value={eventFormData.imagem_url}
                  onChange={(e) => setEventFormData({ ...eventFormData, imagem_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Data do Evento *</label>
                  <input
                    type="date"
                    required
                    value={eventFormData.data_evento}
                    onChange={(e) => setEventFormData({ ...eventFormData, data_evento: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Horário</label>
                  <input
                    type="text"
                    value={eventFormData.hora_evento}
                    onChange={(e) => setEventFormData({ ...eventFormData, hora_evento: e.target.value })}
                    placeholder="Ex: 19:00"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Local</label>
                <input
                  type="text"
                  value={eventFormData.local}
                  onChange={(e) => setEventFormData({ ...eventFormData, local: e.target.value })}
                  placeholder="Ex: Sede Principal / Templo Central"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Descrição</label>
                <textarea
                  rows={3}
                  value={eventFormData.descricao}
                  onChange={(e) => setEventFormData({ ...eventFormData, descricao: e.target.value })}
                  placeholder="Detalhes e programação do evento..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center space-x-6 pt-1">
                <label className="flex items-center space-x-2 cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={eventFormData.requer_inscricao}
                    onChange={(e) => setEventFormData({ ...eventFormData, requer_inscricao: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 accent-blue-600"
                  />
                  <span>Requer Ficha de Inscrição</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={eventFormData.ativo}
                    onChange={(e) => setEventFormData({ ...eventFormData, ativo: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 accent-blue-600"
                  />
                  <span>Evento Ativo</span>
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL FICHA DE INSCRIÇÃO NO EVENTO (PRE-PREENCHIDA OU EM BRANCO) */}
      {selectedEventoInscricao && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Ficha de Inscrição no Evento</h3>
                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">{selectedEventoInscricao.titulo}</p>
              </div>
              <button onClick={() => setSelectedEventoInscricao(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitInscricao} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={inscricaoFormData.nome}
                  onChange={(e) => setInscricaoFormData({ ...inscricaoFormData, nome: e.target.value })}
                  placeholder="Seu nome..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">CPF</label>
                  <input
                    type="text"
                    value={inscricaoFormData.cpf}
                    onChange={(e) => setInscricaoFormData({ ...inscricaoFormData, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={inscricaoFormData.telefone}
                    onChange={(e) => setInscricaoFormData({ ...inscricaoFormData, telefone: e.target.value })}
                    placeholder="(21)..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">E-mail</label>
                <input
                  type="email"
                  value={inscricaoFormData.email}
                  onChange={(e) => setInscricaoFormData({ ...inscricaoFormData, email: e.target.value })}
                  placeholder="seuemail@exemplo.com"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Endereço Residencial</label>
                <input
                  type="text"
                  value={inscricaoFormData.endereco}
                  onChange={(e) => setInscricaoFormData({ ...inscricaoFormData, endereco: e.target.value })}
                  placeholder="Rua, número, bairro..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Congregação</label>
                <input
                  type="text"
                  value={inscricaoFormData.congregacao}
                  onChange={(e) => setInscricaoFormData({ ...inscricaoFormData, congregacao: e.target.value })}
                  placeholder="Jardim Primavera"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
                />
              </div>

              {membroLogged && (
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Ficha pré-preenchida com seus dados de membro cadastrado.</span>
                </p>
              )}

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedEventoInscricao(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md flex items-center space-x-1.5"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar Inscrição'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
