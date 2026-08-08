import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Church, Lock, User, ArrowRight, AlertCircle, Loader2, Mail, Phone, UserPlus, LogIn, Sun, Moon, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

export const Login: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form fields
  const [nomeInput, setNomeInput] = useState('');
  const [loginInput, setLoginInput] = useState('');
  const [senhaInput, setSenhaInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [telefoneInput, setTelefoneInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password Recovery States
  const [isRecoverModalOpen, setIsRecoverModalOpen] = useState(false);
  const [recoverIdentificador, setRecoverIdentificador] = useState('');
  const [recoverResult, setRecoverResult] = useState<{ login: string; senha_provisoria: string; message: string } | null>(null);

  // Force Change Password States (when logging in with temporary password)
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [tempLogin, setTempLogin] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');

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

      if (res.data.exige_nova_senha) {
        setTempLogin(loginInput);
        setTempPassword(senhaInput);
        setNovaSenha('');
        setConfirmarNovaSenha('');
        setIsChangePasswordModalOpen(true);
        setLoading(false);
        return;
      }

      login(res.data.access_token, {
        user_id: res.data.user_id,
        user_nome: res.data.user_nome,
        user_nivel: res.data.user_nivel,
      });

      if (res.data.user_nivel === 'Membro') {
        navigate('/home');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao realizar login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const handleVisitorLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/visitante');
      login(res.data.access_token, {
        user_id: res.data.user_id,
        user_nome: res.data.user_nome,
        user_nivel: res.data.user_nivel,
      });
      navigate('/eventos');
    } catch (err: any) {
      setError('Erro ao entrar como visitante.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setRecoverResult(null);

    try {
      const res = await api.post('/auth/recuperar-senha', { identificador: recoverIdentificador });
      setRecoverResult({
        login: res.data.login,
        senha_provisoria: res.data.senha_provisoria,
        message: res.data.message
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao recuperar senha. Verifique o usuário ou e-mail digitado.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (novaSenha !== confirmarNovaSenha) {
      setError('As senhas não coincidem');
      return;
    }
    if (novaSenha.length < 4) {
      setError('A nova senha deve ter no mínimo 4 caracteres');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/alterar-senha-provisoria', {
        login: tempLogin,
        senha_provisoria: tempPassword,
        nova_senha: novaSenha
      });

      login(res.data.access_token, {
        user_id: res.data.user_id,
        user_nome: res.data.user_nome,
        user_nivel: res.data.user_nivel,
      });

      setIsChangePasswordModalOpen(false);

      if (res.data.user_nivel === 'Membro') {
        navigate('/home');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao salvar nova senha.');
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

      navigate('/home');
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Senha</label>
                <button
                  type="button"
                  onClick={() => { setError(''); setRecoverIdentificador(''); setRecoverResult(null); setIsRecoverModalOpen(true); }}
                  className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={senhaInput}
                  onChange={(e) => setSenhaInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
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
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={senhaInput}
                  onChange={(e) => setSenhaInput(e.target.value)}
                  placeholder="Crie uma senha..."
                  className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-10 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
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

        {/* Visitor Access Action */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 text-center">
          <button
            type="button"
            onClick={handleVisitorLogin}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all flex items-center justify-center space-x-2"
          >
            <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Entrar como Visitante (Ver Eventos)</span>
          </button>
        </div>
      </div>

      {/* MODAL 1: RECUPERAR SENHA (GERAR SENHA PROVISÓRIA) */}
      {isRecoverModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <Lock className="w-4 h-4 text-blue-600" />
                <span>Recuperar Senha de Acesso</span>
              </h3>
              <button onClick={() => setIsRecoverModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <AlertCircle className="w-5 h-5 hidden" />
                <span>✕</span>
              </button>
            </div>

            {!recoverResult ? (
              <form onSubmit={handleRequestPasswordReset} className="space-y-4 text-xs">
                <p className="text-slate-600 dark:text-slate-400">
                  Informe o seu <strong>Login de Usuário</strong> ou <strong>E-mail cadastrado</strong>. O sistema gerará uma nova senha provisória de acesso.
                </p>

                {error && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Login ou E-mail *</label>
                  <input
                    type="text"
                    required
                    value={recoverIdentificador}
                    onChange={(e) => setRecoverIdentificador(e.target.value)}
                    placeholder="Digite seu login ou email..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsRecoverModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md flex items-center space-x-1.5"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Gerar Senha Provisória'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 space-y-2">
                  <p className="font-bold text-sm">Senha Provisória Gerada com Sucesso!</p>
                  <p>{recoverResult.message}</p>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-emerald-500/30 text-center font-mono font-bold text-base text-slate-900 dark:text-slate-100 tracking-widest">
                    {recoverResult.senha_provisoria}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setLoginInput(recoverResult.login);
                    setSenhaInput(recoverResult.senha_provisoria);
                    setIsRecoverModalOpen(false);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-md"
                >
                  Usar esta Senha para Entrar Agora
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: FORÇAR CADASTRAR NOVA SENHA DEFINITIVA */}
      {isChangePasswordModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <Lock className="w-4 h-4 text-amber-500" />
                <span>Cadastrar Nova Senha Definitiva</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Sua conta foi acessada com uma senha provisória. Crie a sua nova senha definitiva abaixo para continuar.
              </p>
            </div>

            <form onSubmit={handleConfirmChangePassword} className="space-y-3.5 text-xs">
              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs">
                  {error}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nova Senha Definitiva *</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    placeholder="Digite sua nova senha..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-10 py-2 text-slate-900 dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Confirmar Nova Senha *</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmarNovaSenha}
                    onChange={(e) => setConfirmarNovaSenha(e.target.value)}
                    placeholder="Confirme a nova senha..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-10 py-2 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 flex items-center justify-center space-x-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Cadastrar Senha e Entrar</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
