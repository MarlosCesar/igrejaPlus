import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Membros } from './pages/Membros';
import { Setores } from './pages/Setores';
import { Escalas } from './pages/Escalas';
import { Carteirinhas } from './pages/Carteirinhas';
import { Relatorios } from './pages/Relatorios';
import { Auditoria } from './pages/Auditoria';
import { Configuracoes } from './pages/Configuracoes';
import { Usuarios } from './pages/Usuarios';

import { HomeMembro } from './pages/HomeMembro';
import { Eventos } from './pages/Eventos';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const DefaultRedirect: React.FC = () => {
  const { user } = useAuth();
  if (user?.user_nivel === 'Membro') {
    return <Navigate to="/home" replace />;
  }
  if (user?.user_nivel === 'Visitante') {
    return <Navigate to="/eventos" replace />;
  }
  return <Navigate to="/dashboard" replace />;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DefaultRedirect />} />
                <Route path="home" element={<HomeMembro />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="eventos" element={<Eventos />} />
                <Route path="membros" element={<Membros />} />
                <Route path="setores" element={<Setores />} />
                <Route path="escalas" element={<Escalas />} />
                <Route path="carteirinhas" element={<Carteirinhas />} />
                <Route path="relatorios" element={<Relatorios />} />
                <Route path="auditoria" element={<Auditoria />} />
                <Route path="configuracoes" element={<Configuracoes />} />
                <Route path="usuarios" element={<Usuarios />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
