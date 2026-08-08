import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  CalendarCheck2,
  CreditCard,
  FileSpreadsheet,
  History,
  Settings,
  UserCog,
  Church
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  onNavigate?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['Administrador', 'Pastor', 'Secretário', 'Líder de Setor'] },
    { label: 'Preencher Ficha de Membro', path: '/membros', icon: Users, roles: ['Administrador', 'Pastor', 'Secretário', 'Líder de Setor', 'Membro'] },
    { label: 'Solicitar Carteirinha', path: '/carteirinhas', icon: CreditCard, roles: ['Administrador', 'Pastor', 'Secretário', 'Líder de Setor', 'Membro'] },
    { label: 'Setores / Ministérios', path: '/setores', icon: ShieldCheck, roles: ['Administrador', 'Pastor', 'Secretário', 'Líder de Setor'] },
    { label: 'Escalas de Culto', path: '/escalas', icon: CalendarCheck2, roles: ['Administrador', 'Pastor', 'Secretário', 'Líder de Setor'] },
    { label: 'Relatórios', path: '/relatorios', icon: FileSpreadsheet, roles: ['Administrador', 'Pastor', 'Secretário'] },
    { label: 'Auditoria & Logs', path: '/auditoria', icon: History, roles: ['Administrador', 'Pastor'] },
    { label: 'Usuários', path: '/usuarios', icon: UserCog, roles: ['Administrador', 'Pastor'] },
    { label: 'Configurações', path: '/configuracoes', icon: Settings, roles: ['Administrador', 'Pastor'] },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 min-h-screen flex flex-col justify-between p-4 z-50 transition-colors duration-200">
      <div>
        {/* Brand Header */}
        <div className="flex items-center space-x-3 px-3 py-4 mb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
            <Church className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-none">
              Igreja<span className="text-blue-600">+</span>
            </h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wider uppercase mt-1">Gestão Eclesiástica</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            if (item.roles && user && !item.roles.includes(user.user_nivel)) {
              return null;
            }
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Igreja+ ERP v1.0</p>
        <p className="text-[10px] text-slate-400">Cloud & Desktop Ready</p>
      </div>
    </aside>
  );
};
