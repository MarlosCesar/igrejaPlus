import React, { useState } from 'react';
import { FileSpreadsheet, FileText, Download, Filter, FileCode } from 'lucide-react';
import api from '../services/api';

export const Relatorios: React.FC = () => {
  const [tipo, setTipo] = useState('membros');
  const [formato, setFormato] = useState('pdf');
  const [situacao, setSituacao] = useState('');
  const [setorId, setSetorId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExportar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.get('/relatorios/exportar', {
        params: { tipo, formato, situacao, setor_id: setorId }
      });
      window.open(res.data.url, '_blank');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center space-x-2">
          <FileSpreadsheet className="w-6 h-6 text-blue-600 dark:text-blue-500" />
          <span>Central de Relatórios & Exportações</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Gere relatórios completos de membros, escalas, setores e auditoria nos formatos PDF, Excel e CSV</p>
      </div>

      {/* Generator Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 max-w-3xl">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
          Configurar Relatório
        </h3>

        <form onSubmit={handleExportar} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tipo de Relatório *</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500"
              >
                <option value="membros">Relatório Geral de Membros</option>
                <option value="aniversariantes">Relatório de Aniversariantes</option>
                <option value="escalas">Relatório de Escalas de Culto</option>
                <option value="setores">Relatório de Setores & Integrantes</option>
                <option value="auditoria">Log de Auditoria do Sistema</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Formato de Exportação *</label>
              <select
                value={formato}
                onChange={(e) => setFormato(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500"
              >
                <option value="pdf">Documento PDF (.pdf)</option>
                <option value="excel">Planilha Excel (.xlsx)</option>
                <option value="csv">Arquivo CSV (.csv)</option>
              </select>
            </div>
          </div>

          {tipo === 'membros' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Filtrar por Situação</label>
                <select
                  value={situacao}
                  onChange={(e) => setSituacao(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Todas as Situações</option>
                  <option value="Ativo">Ativos</option>
                  <option value="Inativo">Inativos</option>
                  <option value="Afastado">Afastados</option>
                  <option value="Visitante">Visitantes</option>
                </select>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{loading ? 'Gerando Relatório...' : 'Gerar e Baixar Relatório'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
