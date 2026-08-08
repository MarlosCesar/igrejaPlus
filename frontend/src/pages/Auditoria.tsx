import React, { useState, useEffect } from 'react';
import { History, ShieldAlert, Loader2, Filter } from 'lucide-react';
import api from '../services/api';
import { AuditLog } from '../types';
import { formatDateTimeBR } from '../utils/formatters';

export const Auditoria: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabela, setTabela] = useState('');
  const [acao, setAcao] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [tabela, acao]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auditoria', { params: { tabela, acao } });
      setLogs(res.data);
    } catch (err) {
      console.error('Erro ao buscar logs de auditoria', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center space-x-2">
          <History className="w-6 h-6 text-blue-600 dark:text-blue-500" />
          <span>Trilha de Auditoria & Segurança</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Registro detalhado de operações e modificações realizadas no sistema</p>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3">
        <select
          value={tabela}
          onChange={(e) => setTabela(e.target.value)}
          className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
        >
          <option value="">Todas as Tabelas</option>
          <option value="membros">Membros</option>
          <option value="setores">Setores</option>
          <option value="escalas">Escalas</option>
          <option value="usuarios">Usuários</option>
          <option value="configuracoes">Configurações</option>
        </select>

        <select
          value={acao}
          onChange={(e) => setAcao(e.target.value)}
          className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
        >
          <option value="">Todas as Ações</option>
          <option value="CREATE">Criação (CREATE)</option>
          <option value="UPDATE">Edição (UPDATE)</option>
          <option value="DELETE">Exclusão (DELETE)</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Nenhum registro de auditoria encontrado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3 font-bold">Data / Hora</th>
                  <th className="p-3 font-bold">Usuário</th>
                  <th className="p-3 font-bold">Ação</th>
                  <th className="p-3 font-bold">Módulo</th>
                  <th className="p-3 font-bold">Descrição da Operação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 text-slate-500 dark:text-slate-400 font-mono">{formatDateTimeBR(log.created_at)}</td>
                    <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{log.usuario_nome || 'Sistema'}</td>
                    <td className="p-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        log.acao === 'CREATE' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                        log.acao === 'UPDATE' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                        'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}>
                        {log.acao}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300 capitalize">{log.tabela}</td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">{log.detalhes || log.acao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
