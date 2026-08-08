import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Church, Lock, User, ArrowRight, AlertCircle, Loader2, Mail, Phone, UserPlus, LogIn, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

export const Login: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Form fields
  const [nomeInput, setNomeInput] = useState('');
  const [loginInput, setLoginInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [telefoneInput, setTelefoneInput] = useState('');
  const [senhaInput, setSenhaInput] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', {
        login: loginInput,
        senha: senhaInput,
      });

      login(res.data.access_token, {
        user_id: res.data.user_id,
        user_nome: res.data.user_nome,
        user_nivel: res.data.user_nivel,
      });

      if (res.data.user_nivel === 'Membro') {
        navigate('/membros');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao realizar login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/register', {
        nome: nomeInput,
        login: loginInput,
        senha: senhaInput,
        email: emailInput,
        telefone: telefoneInput,
      });

      login(res.data.access_token, {
        user_id: res.data.user_id,
        user_nome: res.data.user_nome,
        user_nivel: res.data.user_nivel,
      });

      navigate('/membros');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao cadastrar usuário.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 dark:bg-slate-950 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      {/* Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/15 dark:bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/15 dark:bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="absolute top-5 right-5 p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-md backdrop-blur-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-all z-50 flex items-center space-x-2 text-xs font-semibold"
        title={`Alternar para modo ${theme === 'dark' ? 'claro' : 'escuro'}`}
      >
        {theme === 'dark' ? (
          <>
            <Sun className="w-4 h-4 text-amber-400" />
            <span>Modo Claro</span>
          </>
        ) : (
          <>
            <Moon className="w-4 h-4 text-indigo-600" />
            <span>Modo Escuro</span>
          </>
        )}
      </button>

      <div className="w-full max-w-md bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl z-10 space-y-6 transition-colors duration-300">
        {/* Logo Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-xl shadow-blue-600/30 mb-3">
            <Church className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Igreja<span className="text-blue-600 dark:text-blue-500">+</span>
          </h1>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <button
            type="button"
            onClick={() => { setIsRegisterMode(false); setError(''); }}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
              !isRegisterMode
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Entrar</span>
          </button>
          <button
            type="button"
            onClick={() => { setIsRegisterMode(true); setError(''); }}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
              isRegisterMode
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Cadastrar-se</span>
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start space-x-3 text-red-600 dark:text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {!isRegisterMode ? (
          <form onSubmit={handleSubmitLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Login / Usuário</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  placeholder="Seu usuário..."
                  className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={senhaInput}
                  onChange={(e) => setSenhaInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-600/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 text-sm"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Acessar o Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* REGISTER FORM */
          <form onSubmit={handleSubmitRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome Completo *</label>
              <div className="relative">
                <User className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={nomeInput}
                  onChange={(e) => setNomeInput(e.target.value)}
                  placeholder="Seu nome..."
                  className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Login de Acesso *</label>
              <div className="relative">
                <User className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  placeholder="Crie seu usuário..."
                  className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="email@..."
                    className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-2.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Telefone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={telefoneInput}
                    onChange={(e) => setTelefoneInput(e.target.value)}
                    placeholder="(21)..."
                    className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-2.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Senha *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={senhaInput}
                  onChange={(e) => setSenhaInput(e.target.value)}
                  placeholder="Crie uma senha..."
                  className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
            </div>

            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
              * Este cadastro permite preencher sua ficha de membro e solicitar sua carteirinha oficial.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-blue-600/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 text-xs"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Criar Minha Conta</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
