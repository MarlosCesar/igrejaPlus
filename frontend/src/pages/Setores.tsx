import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Users, Edit, Trash2, Loader2, Check, X, Shield } from 'lucide-react';
import api from '../services/api';
import { Setor, Membro } from '../types';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';

export const Setores: React.FC = () => {
  const [setores, setSetores] = useState<Setor[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIntegrantesModalOpen, setIsIntegrantesModalOpen] = useState(false);
  const [selectedSetor, setSelectedSetor] = useState<Setor | null>(null);
  const [integrantes, setIntegrantes] = useState<Membro[]>([]);
  const [loadingIntegrantes, setLoadingIntegrantes] = useState(false);

  // Form State
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [ativo, setAtivo] = useState(true);

  const { user } = useAuth();
  const canEdit = ['Administrador', 'Secretário', 'Pastor', 'Líder'].includes(user?.user_nivel || '');

  useEffect(() => {
    fetchSetores();
  }, []);

  const fetchSetores = async () => {
    setLoading(true);
    try {
      const res = await api.get('/setores');
      setSetores(res.data);
    } catch (err) {
      console.error('Erro ao buscar setores', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setSelectedSetor(null);
    setNome('');
    setDescricao('');
    setAtivo(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (setor: Setor) => {
    setSelectedSetor(setor);
    setNome(setor.nome);
    setDescricao(setor.descricao || '');
    setAtivo(setor.ativo);
    setIsModalOpen(true);
  };

  const handleOpenIntegrantesModal = async (setor: Setor) => {
    setSelectedSetor(setor);
    setIsIntegrantesModalOpen(true);
    setLoadingIntegrantes(true);
    try {
      const res = await api.get(`/setores/${setor.id}/membros`);
      setIntegrantes(res.data);
    } catch (err) {
      console.error('Erro ao buscar integrantes do setor', err);
    } finally {
      setLoadingIntegrantes(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedSetor) {
        await api.put(`/setores/${selectedSetor.id}`, { nome, descricao, ativo });
      } else {
        await api.post('/setores', { nome, descricao, ativo });
      }
      setIsModalOpen(false);
      fetchSetores();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Erro ao salvar setor');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja desativar este setor?')) return;
    try {
      await api.delete(`/setores/${id}`);
      fetchSetores();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Erro ao deletar setor');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-500" />
            <span>Módulo de Setores & Ministérios</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Departamentos, ministérios e equipes de trabalho da igreja</p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Novo Setor</span>
          </button>
        )}
      </div>

      {/* Grid of Sectors */}
      {loading ? (
        <div className="p-12 flex justify-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : setores.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-xs bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          Nenhum setor cadastrado. Clique em "Criar Novo Setor" para adicionar um setor.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {setores.map((setor) => (
            <div
              key={setor.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    <Shield className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {setor.membros_count} integrantes
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {setor.nome}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 min-h-[32px]">
                  {setor.descricao || 'Sem descrição cadastrada'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => handleOpenIntegrantesModal(setor)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Ver Integrantes</span>
                </button>

                {canEdit && (
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEditModal(setor)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Editar Setor"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(setor.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Desativar Setor"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Criar / Editar Setor */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedSetor ? 'Editar Setor' : 'Criar Novo Setor'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome do Setor / Ministério *</label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Pregador, Louvor, Tio, Professor..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Descrição do Setor</label>
            <textarea
              rows={3}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Responsabilidades e funções do setor..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="ativo"
              checked={ativo}
              onChange={(e) => setAtivo(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="ativo" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Setor Ativo no Sistema</label>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200 dark:border-slate-800">
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
              Salvar Setor
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Integrantes do Setor */}
      <Modal isOpen={isIntegrantesModalOpen} onClose={() => setIsIntegrantesModalOpen(false)} title={`Integrantes do Setor: ${selectedSetor?.nome || ''}`}>
        {loadingIntegrantes ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
          </div>
        ) : integrantes.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">Nenhum membro vinculado a este setor ainda.</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto pr-1">
            {integrantes.map((m) => (
              <div key={m.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">{m.nome}</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{m.cargo || 'Membro'} • {m.congregacao || 'Sede'}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  {m.situacao}
                </span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};
