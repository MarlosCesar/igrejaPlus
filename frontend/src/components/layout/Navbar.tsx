import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, LogOut, User as UserIcon, Church, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { GlobalSearch } from './GlobalSearch';

interface NavbarProps {
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileMenu }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 sm:px-4 md:px-6 flex items-center justify-between z-40 sticky top-0 transition-colors duration-200 gap-2 sm:gap-4">
      {/* Mobile Hamburger Button */}
      <button
        onClick={onToggleMobileMenu}
        className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden shrink-0 border border-slate-200 dark:border-slate-700/50"
        title="Abrir Menu Principal"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-lg min-w-0">
        <GlobalSearch />
      </div>

      {/* Right User Actions */}
      <div className="flex items-center space-x-3">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all border border-slate-200 dark:border-slate-700/50"
          title={`Alternar para modo ${theme === 'dark' ? 'claro' : 'escuro'}`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>

        <div className="h-6 w-px bg-slate-800 dark:bg-slate-800 light:bg-slate-200" />

        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-semibold text-xs">
            {user?.user_nome?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-none">
              {user?.user_nome || 'Usuário'}
            </p>
            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold leading-none mt-1">
              {user?.user_nivel || 'Membro'}
            </p>
          </div>

          <button
            onClick={logout}
            className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors ml-1"
            title="Sair do Sistema"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
