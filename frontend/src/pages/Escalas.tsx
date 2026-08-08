import React, { useState, useEffect } from 'react';
import {
  CalendarCheck2, Plus, Copy, FileSpreadsheet, FileText, Printer, Trash2, UserPlus, Check, Loader2, Calendar, MessageCircle, Sparkles, BookOpen, Layers
} from 'lucide-react';
import api from '../services/api';
import { Escala, Setor, Membro } from '../types';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';

export const Escalas: React.FC = () => {
  const [escalas, setEscalas] = useState<Escala[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [membros, setMembros] = useState<Membro[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isTypeSelectorOpen, setIsTypeSelectorOpen] = useState(false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<'GERAL' | 'EBI'>('GERAL');
  const [selectedEscalaView, setSelectedEscalaView] = useState<Escala | null>(null);

  // Form details
  const [titulo, setTitulo] = useState('ESCALA DO MÊS DE AGOSTO');
  const [mesAno, setMesAno] = useState('AGOSTO/2026');
  const [dataCulto, setDataCulto] = useState(new Date().toISOString().split('T')[0]);
  const [horario, setHorario] = useState('19:00');
  const [culto, setCulto] = useState('Culto de Domingo');
  const [observacoes, setObservacoes] = useState('TODOS OS CULTOS DEVEM SER PRECEDIDOS DE PELO MENOS 15 MINUTOS DE ORAÇÃO!');

  // Escala Geral Grid State (Cultos x Funções)
  const defaultCultosGeral = [
    { data: '01/08', dia: 'Sáb. M.', culto: 'CULTO DAS DÉBORAS' },
    { data: '01/08', dia: 'Sáb. N.', culto: 'CULTO DAS DÉBORAS' },
    { data: '02/08', dia: 'Dom. M.', culto: 'CULTO DOMINICAL' },
    { data: '02/08', dia: 'Dom. N.', culto: 'CULTO DOMINICAL' },
    { data: '05/08', dia: '4ª feira', culto: 'CULTO DE ENSINO' },
    { data: '08/08', dia: 'Sáb. M.', culto: 'CULTO FEMININO ACALMAR' },
    { data: '09/08', dia: 'Dom. M.', culto: 'SANTA CEIA' },
    { data: '09/08', dia: 'Dom. N.', culto: 'SANTA CEIA' },
    { data: '12/08', dia: '4ª feira', culto: 'CULTO DE ORAÇÃO' },
    { data: '15/08', dia: 'Sáb. M.', culto: 'CULTO CONSAGRAÇÃO' },
    { data: '16/08', dia: 'Dom. M.', culto: 'CULTO DOMINICAL' },
    { data: '16/08', dia: 'Dom. N.', culto: 'CULTO DOMINICAL' },
    { data: '19/08', dia: '4ª feira', culto: 'CULTO DE ENSINO' },
    { data: '22/08', dia: 'Sáb. N.', culto: 'CULTO JOVEM' },
    { data: '23/08', dia: 'Dom. M.', culto: 'SANTA CEIA' },
    { data: '23/08', dia: 'Dom. N.', culto: 'SANTA CEIA' },
    { data: '26/08', dia: '4ª feira', culto: 'UNÇÃO COM ÓLEO' },
    { data: '30/08', dia: 'Dom. M.', culto: 'CULTO DOMINICAL' },
    { data: '30/08', dia: 'Dom. N.', culto: 'CULTO DOMINICAL' }
  ];

  const funcoesGeral = [
    'PREGADOR', 'INTRODUTOR', 'OFERTÓRIO', 'DIRIGENTE DE LOUVOR', 'APOIO BACKVOCAL',
    'TECLADO', 'BATERIA', 'GUITARRA / VIOLÃO', 'BAIXO', 'DATA SHOW / MÍDIA'
  ];

  // Matrix cells state: { [cultoIndex_funcao]: string }
  const [matrizGeral, setMatrizGeral] = useState<{ [key: string]: string }>({});

  // Escala EBI Grid State (Salas x Domingos)
  const domingosEBI = ['1º Domingo (02/08)', '2º Domingo (09/08)', '3º Domingo (16/08)', '4º Domingo (23/08)', '5º Domingo (30/08)'];
  const salasEBI = [
    { key: 'bercario_manha', label: 'Berçário (0 a 4 anos) - Manhã' },
    { key: 'bercario_noite', label: 'Berçário (0 a 4 anos) - Noite' },
    { key: 'jardim', label: 'Jardim (5 a 7 anos)' },
    { key: 'juniores', label: 'Juniores (8 a 12 anos)' },
    { key: 'adolescentes', label: 'Adolescentes (13 a 17 anos)' }
  ];

  // EBI Matrix cells state: { [salaKey_domingoIndex]: string }
  const [matrizEBI, setMatrizEBI] = useState<{ [key: string]: string }>({});

  const { user } = useAuth();
  const canEdit = ['Administrador', 'Secretário', 'Pastor', 'Líder'].includes(user?.user_nivel || '');

  useEffect(() => {
    fetchEscalas();
    fetchSetoresEMembros();
  }, []);

  const fetchEscalas = async () => {
    setLoading(true);
    try {
      const res = await api.get('/escalas');
      setEscalas(res.data);
    } catch (err) {
      console.error('Erro ao buscar escalas', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSetoresEMembros = async () => {
    try {
      const [setoresRes, membrosRes] = await Promise.all([
        api.get('/setores'),
        api.get('/membros')
      ]);
      setSetores(setoresRes.data);
      setMembros(membrosRes.data);
    } catch (err) {
      console.error('Erro ao buscar dados', err);
    }
  };

  const handleOpenTypeSelector = () => {
    setIsTypeSelectorOpen(true);
  };

  const handleSelectType = (type: 'GERAL' | 'EBI') => {
    setSelectedType(type);
    setIsTypeSelectorOpen(false);

    if (type === 'GERAL') {
      setTitulo('ESCALA DO MÊS DE AGOSTO');
      setCulto('Escala Geral de Cultos');
    } else {
      setTitulo('ESCOLA BÍBLICA INFANTIL - EBI');
      setCulto('Escala EBI Infantil');
    }

    setIsBuilderOpen(true);
  };

  const handleSaveEscala = async (e: React.FormEvent) => {
    e.preventDefault();

    const dadosMatrizPayload = JSON.stringify(
      selectedType === 'GERAL'
        ? { cultos: defaultCultosGeral, funcoes: funcoesGeral, matriz: matrizGeral }
        : { domingos: domingosEBI, salas: salasEBI, matriz: matrizEBI }
    );

    try {
      await api.post('/escalas', {
        titulo,
        tipo_escala: selectedType,
        mes_ano: mesAno,
        data: dataCulto,
        horario,
        culto,
        observacoes,
        dados_matriz: dadosMatrizPayload,
        itens: []
      });

      setIsBuilderOpen(false);
      setMatrizGeral({});
      setMatrizEBI({});
      fetchEscalas();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Erro ao salvar escala');
    }
  };

  const handleDeleteEscala = async (escalaId: number) => {
    if (!window.confirm('Tem certeza que deseja excluir esta escala do histórico?')) return;
    try {
      await api.delete(`/escalas/${escalaId}`);
      fetchEscalas();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Erro ao excluir escala');
    }
  };

  const handleDuplicar = async (escalaId: number) => {
    const novaData = prompt('Informe a nova data para a cópia (AAAA-MM-DD):', new Date().toISOString().split('T')[0]);
    if (!novaData) return;

    try {
      await api.post(`/escalas/${escalaId}/duplicar`, null, { params: { nova_data: novaData } });
      fetchEscalas();
    } catch (err) {
      alert('Erro ao duplicar escala');
    }
  };

  const calculateCultosForMonth = (mesNome: string, anoNum: number) => {
    const mesesMap: { [key: string]: number } = {
      JANEIRO: 0, FEVEREIRO: 1, MARÇO: 2, ABRIL: 3, MAIO: 4, JUNHO: 5,
      JULHO: 6, AGOSTO: 7, SETEMBRO: 8, OUTUBRO: 9, NOVEMBRO: 10, DEZEMBRO: 11
    };

    const monthIndex = mesesMap[mesNome.toUpperCase()] !== undefined ? mesesMap[mesNome.toUpperCase()] : 7;
    const dateObj = new Date(anoNum, monthIndex, 1);
    const cultosList: { data: string; dia: string; culto: string }[] = [];
    const domingosList: string[] = [];

    let domCount = 0;
    const daysInMonth = new Date(anoNum, monthIndex + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(anoNum, monthIndex, day);
      const dayOfWeek = d.getDay(); // 0 = Sunday, 3 = Wednesday, 6 = Saturday
      const dateStr = `${day}/${monthIndex + 1}`;

      if (dayOfWeek === 6) { // Saturday
        cultosList.push({ data: dateStr, dia: 'Sáb. M.', culto: 'CULTO DAS DÉBORAS' });
        cultosList.push({ data: dateStr, dia: 'Sáb. N.', culto: 'CULTO DE JOVENS / CONSAG.' });
      } else if (dayOfWeek === 0) { // Sunday
        domCount++;
        const formattedDom = `${domCount}º Dom. (${day.toString().padStart(2, '0')}/${(monthIndex + 1).toString().padStart(2, '0')})`;
        domingosList.push(formattedDom);

        cultosList.push({ data: dateStr, dia: 'Dom. M.', culto: domCount === 2 || domCount === 4 ? 'SANTA CEIA' : 'CULTO DOMINICAL' });
        cultosList.push({ data: dateStr, dia: 'Dom. N.', culto: domCount === 2 || domCount === 4 ? 'SANTA CEIA' : 'CULTO DOMINICAL' });
      } else if (dayOfWeek === 3) { // Wednesday
        cultosList.push({ data: dateStr, dia: '4ª feira', culto: 'CULTO DE ENSINO' });
      }
    }

    return { cultosList, domingosList };
  };

  const handleShareWhatsApp = (escala: Escala) => {
    let text = `*${escala.titulo.toUpperCase()}*\n`;
    text += `*Mês:* ${escala.mes_ano || 'Agosto'}\n\n`;

    if (escala.dados_matriz) {
      try {
        const payload = JSON.parse(escala.dados_matriz);
        if (escala.tipo_escala === 'EBI') {
          text += `*ESCALA EBI INFANTIL:*\n`;
          payload.salas?.forEach((sala: any) => {
            text += `\n📌 *${sala.label}*:\n`;
            payload.domingos?.forEach((dom: string, idx: number) => {
              const val = payload.matriz[`${sala.key}_${idx}`] || '-';
              text += `  • ${dom}: *${val}*\n`;
            });
          });
        } else {
          text += `*ESCALA GERAL DE CULTOS:*\n`;
          payload.cultos?.forEach((c: any, cIdx: number) => {
            text += `\n🗓️ *${c.data} (${c.dia}) - ${c.culto}*\n`;
            payload.funcoes?.forEach((f: string) => {
              const val = payload.matriz[`${cIdx}_${f}`] || '-';
              if (val !== '-') {
                text += `  • ${f}: *${val}*\n`;
              }
            });
          });
        }
      } catch (e) {
        text += `Escala salva no sistema Igreja+.\n`;
      }
    }

    if (escala.observacoes) {
      text += `\n*Obs:* ${escala.observacoes}\n`;
    }

    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleExportPDF = async (escalaId: number) => {
    try {
      const res = await api.get(`/escalas/${escalaId}/exportar/pdf`);
      window.open(res.data.url, '_blank');
    } catch (err) {
      alert('Erro ao exportar PDF');
    }
  };

  const handleExportExcel = async (escalaId: number) => {
    try {
      const res = await api.get(`/escalas/${escalaId}/exportar/excel`);
      window.open(res.data.url, '_blank');
    } catch (err) {
      alert('Erro ao exportar Excel');
    }
  };

  const formatNameWithTitle = (membro: Membro) => {
    const prefix = membro.cargo && membro.cargo !== 'Membro' ? `${membro.cargo} ` : '';
    return `${prefix}${membro.nome}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center space-x-2">
            <CalendarCheck2 className="w-6 h-6 text-blue-600 dark:text-blue-500" />
            <span>Gerenciador de Escalas da Igreja & EBI</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Crie escalas da Igreja Geral ou da Escola Bíblica Infantil com modelo idêntico</p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenTypeSelector}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Nova Escala</span>
          </button>
        )}
      </div>

      {/* Escalas Cards / History List */}
      {loading ? (
        <div className="p-12 flex justify-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : escalas.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-xs bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          Nenhuma escala salva no histórico. Clique em "Criar Nova Escala" para gerar uma nova escala.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {escalas.map((escala) => {
            let parsedData: any = null;
            if (escala.dados_matriz) {
              try {
                parsedData = JSON.parse(escala.dados_matriz);
              } catch (e) {}
            }

            return (
              <div key={escala.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        escala.tipo_escala === 'EBI'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                      }`}>
                        {escala.tipo_escala === 'EBI' ? 'ESCOLA BÍBLICA INFANTIL' : 'ESCALA GERAL'}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{escala.mes_ano || '2026'}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">{escala.titulo}</h3>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleShareWhatsApp(escala)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10"
                      title="Enviar pelo WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleExportPDF(escala.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                      title="Exportar PDF"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleExportExcel(escala.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10"
                      title="Exportar Excel"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                    </button>
                    {canEdit && (
                      <>
                        <button
                          onClick={() => handleDuplicar(escala.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-purple-400 hover:bg-purple-500/10"
                          title="Duplicar Escala"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEscala(escala.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                          title="Excluir Escala"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Preview Thumbnail Table */}
                <div className="overflow-x-auto text-[10px] bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  {escala.tipo_escala === 'EBI' && parsedData?.salas ? (
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-amber-600 dark:text-amber-400 font-bold">
                          <th className="py-1">Salas</th>
                          {parsedData.domingos?.map((d: string, i: number) => (
                            <th key={i} className="py-1 px-1">{d.split(' ')[0]}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800/40">
                        {parsedData.salas.map((sala: any) => (
                          <tr key={sala.key}>
                            <td className="py-1 font-semibold text-slate-900 dark:text-slate-200">{sala.label.split(' ')[0]}</td>
                            {parsedData.domingos?.map((_: any, idx: number) => (
                              <td key={idx} className="py-1 px-1 text-slate-600 dark:text-slate-400 truncate max-w-[80px]">
                                {parsedData.matriz[`${sala.key}_${idx}`] || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-slate-600 dark:text-slate-400 py-2">
                      <p className="font-semibold text-slate-900 dark:text-slate-300">Escala de Cultos com {parsedData?.cultos?.length || 19} horários agendados.</p>
                      <p className="mt-1 text-[9px] text-slate-500 dark:text-slate-500">Clique nos ícones acima para visualizar completo, exportar PDF ou enviar no WhatsApp.</p>
                    </div>
                  )}
                </div>

                {escala.observacoes && (
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium italic">
                    Obs: {escala.observacoes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal 1: Selecionar Modelo de Escala */}
      <Modal isOpen={isTypeSelectorOpen} onClose={() => setIsTypeSelectorOpen(false)} title="Qual modelo de escala deseja criar?">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
          <button
            onClick={() => handleSelectType('GERAL')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-600/10 text-left space-y-3 transition-all group"
          >
            <div className="p-3 rounded-xl bg-blue-600/20 text-blue-600 dark:text-blue-400 inline-block group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">Escala Geral de Cultos</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Grade mensal completa com Pregador, Introdutor, Ofertório, Dirigente, Apoio, Músicos e Mídia.</p>
            </div>
          </button>

          <button
            onClick={() => handleSelectType('EBI')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-amber-500 hover:bg-amber-600/10 text-left space-y-3 transition-all group"
          >
            <div className="p-3 rounded-xl bg-amber-600/20 text-amber-600 dark:text-amber-400 inline-block group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400">Escola Bíblica Infantil (EBI)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Grade mensal por domingos para Berçário, Jardim, Juniores e Adolescentes.</p>
            </div>
          </button>
        </div>
      </Modal>

      {/* Modal 2: Gerador de Matriz de Escala */}
      <Modal
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        title={selectedType === 'GERAL' ? 'Criar Escala Geral de Cultos da Igreja' : 'Criar Escala da Escola Bíblica Infantil (EBI)'}
        maxWidth="max-w-6xl"
      >
        <form onSubmit={handleSaveEscala} className="space-y-6">
          {/* Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Título da Escala *</label>
              <input
                type="text"
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Mês / Ano *</label>
              <input
                type="text"
                required
                value={mesAno}
                onChange={(e) => setMesAno(e.target.value)}
                placeholder="Ex: AGOSTO/2026"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Observações do Rodapé</label>
              <input
                type="text"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Matrix Editor for ESCALA GERAL */}
          {selectedType === 'GERAL' && (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 max-h-[500px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-2 border-r border-slate-200 dark:border-slate-800 min-w-[150px] font-bold text-blue-600 dark:text-blue-400">FUNÇÃO / SETOR</th>
                    {defaultCultosGeral.map((c, idx) => (
                      <th key={idx} className="p-2 border-r border-slate-200 dark:border-slate-800 text-center min-w-[120px]">
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{c.culto}</p>
                        <p className="font-bold text-slate-900 dark:text-slate-100">{c.data} ({c.dia})</p>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900/60">
                  {funcoesGeral.map((funcao) => (
                    <tr key={funcao} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="p-2 font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">{funcao}</td>
                      {defaultCultosGeral.map((_, cIdx) => {
                        const cellKey = `${cIdx}_${funcao}`;
                        return (
                          <td key={cellKey} className="p-1 border-r border-slate-200 dark:border-slate-800">
                            <select
                              value={matrizGeral[cellKey] || ''}
                              onChange={(e) => setMatrizGeral({ ...matrizGeral, [cellKey]: e.target.value })}
                              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-1.5 py-1 text-[11px] text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="">// Vazio</option>
                              {membros.map((m) => (
                                <option key={m.id} value={formatNameWithTitle(m)}>
                                  {formatNameWithTitle(m)}
                                </option>
                              ))}
                            </select>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Matrix Editor for ESCALA EBI */}
          {selectedType === 'EBI' && (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3 border-r border-slate-200 dark:border-slate-800 font-bold text-amber-600 dark:text-amber-400">SALAS DE AULA (EBI)</th>
                    {domingosEBI.map((dom, dIdx) => (
                      <th key={dIdx} className="p-3 border-r border-slate-200 dark:border-slate-800 text-center font-bold text-slate-900 dark:text-slate-100">
                        {dom}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900/60">
                  {salasEBI.map((sala) => (
                    <tr key={sala.key} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">{sala.label}</td>
                      {domingosEBI.map((_, dIdx) => {
                        const cellKey = `${sala.key}_${dIdx}`;
                        return (
                          <td key={cellKey} className="p-2 border-r border-slate-200 dark:border-slate-800">
                            <select
                              value={matrizEBI[cellKey] || ''}
                              onChange={(e) => setMatrizEBI({ ...matrizEBI, [cellKey]: e.target.value })}
                              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-amber-500"
                            >
                              <option value="">-- Selecione Tio/Professor --</option>
                              {membros.map((m) => (
                                <option key={m.id} value={formatNameWithTitle(m)}>
                                  {formatNameWithTitle(m)}
                                </option>
                              ))}
                            </select>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
            <button type="button" onClick={() => setIsBuilderOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-400">
              Cancelar
            </button>
            <button type="submit" className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg">
              Salvar Escala do Mês
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
