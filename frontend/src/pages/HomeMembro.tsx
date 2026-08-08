import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, CreditCard, Calendar, ShieldCheck, ArrowRight, CheckCircle2, UserCheck, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Membro, Carteirinha } from '../types';

export const HomeMembro: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [membro, setMembro] = useState<Membro | null>(null);
  const [carteirinha, setCarteirinha] = useState<Carteirinha | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemberData();
  }, []);

  const fetchMemberData = async () => {
    setLoading(true);
    try {
      const [resMembros, resCards] = await Promise.all([
        api.get('/membros'),
        api.get('/carteirinhas')
      ]);

      if (resMembros.data && resMembros.data.length > 0) {
        setMembro(resMembros.data[0]);
      }
      if (resCards.data && resCards.data.length > 0) {
        setCarteirinha(resCards.data[0]);
      }
    } catch (err) {
      console.error('Erro ao carregar dados do membro', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 opacity-10 pointer-events-none">
          <Users className="w-96 h-96" />
        </div>

        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold">
            <UserCheck className="w-4 h-4 text-blue-200" />
            <span>Área do Membro — {user?.user_nome}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Bem-vindo ao Igreja<span className="text-blue-300">+</span>
          </h1>

          <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
            Aqui você pode atualizar sua ficha de membro, solicitar sua carteirinha de identificação eclesiástica com QR Code e participar dos eventos da igreja.
          </p>
        </div>
      </div>

      {/* Quick Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Membros (Ficha) */}
        <div
          onClick={() => navigate('/membros')}
          className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group space-y-4 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Minha Ficha de Membro
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Mantenha seus dados pessoais, endereço residencial e contato atualizados.
              </p>
            </div>
          </div>

          <div className="flex items-center text-xs font-bold text-blue-600 dark:text-blue-400 pt-2">
            <span>Acessar Ficha</span>
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Carteirinha */}
        <div
          onClick={() => navigate('/carteirinhas')}
          className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group space-y-4 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Minha Carteirinha
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Visualizar modelo oficial com foto, enquadramento e QR Code de validação.
              </p>
            </div>
          </div>

          <div className="flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 pt-2">
            <span>Ver Carteirinha</span>
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Eventos */}
        <div
          onClick={() => navigate('/eventos')}
          className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group space-y-4 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Eventos da Igreja
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Confira a programação e inscreva-se com sua ficha pré-preenchida.
              </p>
            </div>
          </div>

          <div className="flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 pt-2">
            <span>Ver Programação</span>
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};
