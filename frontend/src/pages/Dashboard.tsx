import React, { useState, useEffect } from 'react';
import {
  Users, UserCheck, Droplets, Cake, CalendarCheck2, Activity, Calendar
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import api from '../services/api';
import { DashboardStats } from '../types';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Erro ao carregar stats', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total de Membros',
      value: stats?.total_membros || 0,
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Novos (Mês)',
      value: stats?.novos_membros_mes || 0,
      icon: UserCheck,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-500/10'
    },
    {
      title: 'Batismos',
      value: stats?.total_batismos || 0,
      icon: Droplets,
      color: 'text-cyan-600 dark:text-cyan-400',
      bgColor: 'bg-cyan-500/10'
    },
    {
      title: 'Aniversariantes',
      value: stats?.aniversariantes_mes || 0,
      icon: Cake,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-500/10'
    },
    {
      title: 'Escalas Ativas',
      value: stats?.proximas_escalas_count || 0,
      icon: CalendarCheck2,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'Usuários Online',
      value: stats?.usuarios_online_count || 1,
      icon: Activity,
      color: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-500/10'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Painel de Controle</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Visão geral do engajamento e atividades da igreja</p>
      </div>

      {/* Top 6 KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
              <div>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{card.title}</p>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">{card.value}</h3>
              </div>
              <div className={`p-2.5 rounded-xl ${card.bgColor} ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Setores Pie Chart */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Distribuição de Membros por Setor</h3>
          <div className="h-64 flex items-center justify-center">
            {stats?.membros_por_setor && stats.membros_por_setor.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.membros_por_setor}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="nome"
                  >
                    {stats.membros_por_setor.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', color: '#F8FAFC', borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400">Nenhum dado cadastrado.</p>
            )}
          </div>
        </div>

        {/* Situação Bar Chart */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Situação dos Membros</h3>
          <div className="h-64 flex items-center justify-center">
            {stats?.membros_por_situacao && stats.membros_por_situacao.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.membros_por_situacao}>
                  <XAxis dataKey="situacao" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', color: '#F8FAFC', borderRadius: '12px' }} />
                  <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400">Nenhum dado cadastrado.</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Lists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aniversariantes do Mês */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <Cake className="w-4 h-4 text-amber-500" />
              <span>Aniversariantes deste Mês</span>
            </h3>
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{stats?.aniversariantes_lista?.length || 0} membros</span>
          </div>

          {stats?.aniversariantes_lista && stats.aniversariantes_lista.length > 0 ? (
            <div className="space-y-2">
              {stats.aniversariantes_lista.map((m) => (
                <div key={m.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/60 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs">
                      {m.nome.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{m.nome}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{m.congregacao || 'Sede'}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-amber-500">Dia {m.dia}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-8">Nenhum aniversariante neste mês.</p>
          )}
        </div>

        {/* Próximas Escalas */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span>Próximas Escalas de Culto</span>
            </h3>
            <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">{stats?.proximas_escalas_lista?.length || 0} agendadas</span>
          </div>

          {stats?.proximas_escalas_lista && stats.proximas_escalas_lista.length > 0 ? (
            <div className="space-y-2">
              {stats.proximas_escalas_lista.map((e) => (
                <div key={e.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/60 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{e.titulo}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{e.culto} • {e.horario}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">{e.data}</span>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{e.total_integrantes} integrantes</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-8">Nenhuma escala cadastrada.</p>
          )}
        </div>
      </div>
    </div>
  );
};
