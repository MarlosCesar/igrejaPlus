import React from 'react';

interface BadgeProps {
  status: string;
}

export const Badge: React.FC<BadgeProps> = ({ status }) => {
  let badgeStyle = 'bg-slate-800 text-slate-300 border-slate-700';

  const normalized = status?.toLowerCase() || '';

  if (['ativo', 'ativa', 'administrador', 'sucesso'].includes(normalized)) {
    badgeStyle = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  } else if (['inativo', 'inativa', 'afastado', 'vencida', 'cancelada'].includes(normalized)) {
    badgeStyle = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  } else if (['visitante', 'consulta', 'lider'].includes(normalized)) {
    badgeStyle = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  } else if (['secretário', 'pastor'].includes(normalized)) {
    badgeStyle = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badgeStyle}`}>
      {status}
    </span>
  );
};
