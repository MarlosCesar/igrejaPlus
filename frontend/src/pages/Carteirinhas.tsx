import React, { useState, useEffect } from 'react';
import { CreditCard, Printer, Search, RefreshCw, Loader2, Download, CheckCircle2, X, Edit, Trash2, ShieldCheck, QrCode, Camera, ZoomIn, Move, RotateCcw } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Carteirinha, Membro } from '../types';
import { formatDateBR } from '../utils/formatters';

interface MembroPendente {
  id: number;
  nome: string;
  cargo: string;
  congregacao: string;
  foto?: string;
  cpf?: string;
  data_batismo?: string;
}

export const Carteirinhas: React.FC = () => {
  const { user } = useAuth();
  const [carteirinhas, setCarteirinhas] = useState<Carteirinha[]>([]);
  const [membrosPendentes, setMembrosPendentes] = useState<MembroPendente[]>([]);
  const [membrosTodos, setMembrosTodos] = useState<Membro[]>([]);
  const [selectedMembroId, setSelectedMembroId] = useState<string>('');
  const [previewMembro, setPreviewMembro] = useState<MembroPendente | null>(null);
  const [editingCarteirinhaId, setEditingCarteirinhaId] = useState<number | null>(null);

  // Photo Crop/Zoom Controls
  const [imgZoom, setImgZoom] = useState<number>(1);
  const [imgX, setImgX] = useState<number>(0);
  const [imgY, setImgY] = useState<number>(0);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoLocalPreview, setFotoLocalPreview] = useState<string | null>(null);

  // Upload progress state
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatusMsg, setUploadStatusMsg] = useState<string>('');

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [busca, setBusca] = useState('');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resCards, resPendentes, resTodos] = await Promise.all([
        api.get('/carteirinhas'),
        api.get('/carteirinhas/pendentes'),
        api.get('/membros')
      ]);
      setCarteirinhas(resCards.data);
      setMembrosPendentes(resPendentes.data);
      setMembrosTodos(resTodos.data);
    } catch (err) {
      console.error('Erro ao buscar carteirinhas', err);
    } finally {
      setLoading(false);
    }
  };

  const getFotoUrl = (url?: string | null) => {
    if (fotoLocalPreview) return fotoLocalPreview;
    if (!url) return null;
    if (url.startsWith('blob:') || url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const backendUrl = api.defaults.baseURL ? api.defaults.baseURL.replace('/api/v1', '') : 'http://127.0.0.1:8000';
    return `${backendUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const handleSelectMembro = (membroIdStr: string) => {
    setSelectedMembroId(membroIdStr);
    setImageError(false);
    setFotoFile(null);
    setFotoLocalPreview(null);
    setImgZoom(1);
    setImgX(0);
    setImgY(0);
    setUploadProgress(0);

    if (!membroIdStr) {
      setPreviewMembro(null);
      setEditingCarteirinhaId(null);
      return;
    }

    const mId = parseInt(membroIdStr);
    const mPendente = membrosPendentes.find((m) => m.id === mId);
    if (mPendente) {
      setPreviewMembro(mPendente);
      setEditingCarteirinhaId(null);
    } else {
      const mFull = membrosTodos.find((m) => m.id === mId);
      if (mFull) {
        setPreviewMembro({
          id: mFull.id,
          nome: mFull.nome,
          cargo: mFull.cargo || 'Membro',
          congregacao: mFull.congregacao || 'Jardim Primavera',
          foto: mFull.foto,
          cpf: mFull.cpf,
          data_batismo: mFull.data_batismo
        });
      }
    }
  };

  const handleEditCarteirinha = (card: Carteirinha) => {
    setEditingCarteirinhaId(card.id);
    setSelectedMembroId(String(card.membro_id));
    setImageError(false);
    setFotoFile(null);
    setFotoLocalPreview(null);
    setImgZoom(1);
    setImgX(0);
    setImgY(0);
    setUploadProgress(0);

    const mFull = membrosTodos.find((m) => m.id === card.membro_id);
    if (mFull) {
      setPreviewMembro({
        id: mFull.id,
        nome: mFull.nome,
        cargo: mFull.cargo || 'Membro',
        congregacao: mFull.congregacao || 'Jardim Primavera',
        foto: mFull.foto,
        cpf: mFull.cpf,
        data_batismo: mFull.data_batismo
      });
    } else {
      setPreviewMembro({
        id: card.membro_id,
        nome: card.membro_nome || 'Membro',
        cargo: 'Membro',
        congregacao: card.congregacao || 'Jardim Primavera',
        foto: card.membro_foto
      });
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelSelection = () => {
    setSelectedMembroId('');
    setPreviewMembro(null);
    setEditingCarteirinhaId(null);
    setFotoFile(null);
    setFotoLocalPreview(null);
    setImgZoom(1);
    setImgX(0);
    setImgY(0);
    setUploadProgress(0);
    setImageError(false);
  };

  const handleFotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFotoFile(file);
      setFotoLocalPreview(URL.createObjectURL(file));
      setImageError(false);
    }
  };

  // Render photo canvas with zoom & position offset preserving natural aspect ratio
  const createCroppedPhotoBlob = (imageSrc: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = 400;
        canvas.height = 500;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        // Translate center + user position offsets
        ctx.translate(canvas.width / 2 + imgX * 3, canvas.height / 2 + imgY * 3);
        ctx.scale(imgZoom, imgZoom);

        // Calculate aspect-ratio cover dimensions to avoid stretching ("foto estreita")
        const imgRatio = img.width / img.height;
        const canvasRatio = canvas.width / canvas.height;
        let drawW = canvas.width;
        let drawH = canvas.height;

        if (imgRatio > canvasRatio) {
          drawW = canvas.height * imgRatio;
        } else {
          drawH = canvas.width / imgRatio;
        }

        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();

        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Erro ao processar imagem no canvas'));
        }, 'image/jpeg', 0.95);
      };
      img.onerror = () => reject(new Error('Erro ao carregar imagem para corte'));
      img.src = imageSrc;
    });
  };

  const handleGerarCarteirinha = async () => {
    if (!selectedMembroId || !previewMembro) return;
    setGenerating(true);
    setUploadProgress(10);
    setUploadStatusMsg('Iniciando processamento da foto e carteirinha...');

    try {
      const currentPhotoSrc = getFotoUrl(previewMembro.foto);

      // Process photo if file selected or if zoom/offsets adjusted
      if (currentPhotoSrc) {
        setUploadProgress(35);
        setUploadStatusMsg('Enquadrando foto com zoom e posição ajustados...');

        let blobToUpload: Blob;
        if (fotoFile) {
          blobToUpload = await createCroppedPhotoBlob(fotoLocalPreview!);
        } else {
          try {
            blobToUpload = await createCroppedPhotoBlob(currentPhotoSrc);
          } catch (e) {
            blobToUpload = fotoFile || new Blob();
          }
        }

        if (blobToUpload.size > 0) {
          setUploadProgress(60);
          setUploadStatusMsg('Enviando e salvando foto de alta resolução do membro...');

          const formDataFoto = new FormData();
          const fileToUpload = new File([blobToUpload], `foto_membro_${previewMembro.id}.jpg`, { type: 'image/jpeg' });
          formDataFoto.append('file', fileToUpload);
          formDataFoto.append('foto', fileToUpload);

          await api.post(`/membros/${previewMembro.id}/foto`, formDataFoto, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        }
      }

      setUploadProgress(85);
      setUploadStatusMsg('Gerando registro oficial e código QR da carteirinha...');

      await api.post('/carteirinhas', {
        membro_id: previewMembro.id,
        validade_meses: 12
      });

      setUploadProgress(100);
      setUploadStatusMsg('Carteirinha gerada com sucesso!');

      setTimeout(() => {
        handleCancelSelection();
        fetchData();
      }, 600);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Erro ao emitir carteirinha');
      setUploadProgress(0);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPdf = async (cardId: number) => {
    setDownloadingId(cardId);
    try {
      const res = await api.get(`/carteirinhas/${cardId}/pdf`);
      if (res.data.pdf_url) {
        const backendUrl = api.defaults.baseURL ? api.defaults.baseURL.replace('/api/v1', '') : 'http://127.0.0.1:8000';
        const fullPdfUrl = `${backendUrl}${res.data.pdf_url}`;
        window.open(fullPdfUrl, '_blank');
      }
    } catch (err) {
      alert('Erro ao gerar PDF da carteirinha');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDeleteCarteirinha = async (cardId: number) => {
    if (!window.confirm('Deseja cancelar a emissão desta carteirinha? O membro retornará para a lista de pendentes.')) return;
    try {
      await api.delete(`/carteirinhas/${cardId}`);
      fetchData();
    } catch (err) {
      alert('Erro ao excluir carteirinha');
    }
  };

  const carteirinhasFiltradas = carteirinhas.filter((c) =>
    c.membro_nome?.toLowerCase().includes(busca.toLowerCase()) ||
    c.congregacao?.toLowerCase().includes(busca.toLowerCase())
  );

  const isMembroOnly = user?.user_nivel === 'Membro';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center space-x-2">
          <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-500" />
          <span>{isMembroOnly ? 'Minha Carteirinha Eclesiástica' : 'Gestão de Carteirinhas de Membros'}</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {isMembroOnly ? 'Visualização e impressão da sua carteirinha de membro com QR Code' : 'Emissão, atualização e impressão de carteirinhas de identificação eclesiástica com QR Code'}
        </p>
      </div>

      {/* Admin Issue Section Card - Hidden for Membro */}
      {!isMembroOnly && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <RefreshCw className="w-4 h-4 text-blue-600" />
            <span>{editingCarteirinhaId ? 'Editar / Atualizar Carteirinha Emitida' : 'Emitir Nova Carteirinha de Membro'}</span>
          </div>

          {/* Dropdown & Buttons Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <select
            value={selectedMembroId}
            onChange={(e) => handleSelectMembro(e.target.value)}
            className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">-- Selecione um Membro Pendente ({membrosPendentes.length} disponíveis) --</option>
            {membrosPendentes.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome} — {m.cargo} ({m.congregacao || 'Jardim Primavera'})
              </option>
            ))}
            {editingCarteirinhaId && previewMembro && !membrosPendentes.some(p => p.id === previewMembro.id) && (
              <option value={previewMembro.id}>
                [Em Edição] {previewMembro.nome} — {previewMembro.cargo}
              </option>
            )}
          </select>

          {previewMembro && (
            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={handleCancelSelection}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold text-xs transition-all inline-flex items-center space-x-1.5"
              >
                <X className="w-4 h-4" />
                <span>Cancelar</span>
              </button>

              <button
                onClick={handleGerarCarteirinha}
                disabled={generating}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/25 transition-all inline-flex items-center space-x-2 disabled:opacity-50"
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{editingCarteirinhaId ? 'Salvar Alterações' : 'Gerar Carteirinha'}</span>
              </button>
            </div>
          )}
        </div>

        {/* MODELO DA CARTEIRINHA LIVE PREVIEW + PAINEL DE ENQUADRAMENTO DE FOTO */}
        {previewMembro && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4 animate-in fade-in duration-200">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Modelo Oficial de Carteirinha & Ajuste da Foto</span>
            </h4>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Modelo de Carteirinha (Card visual) */}
              <div className="lg:col-span-7 flex justify-center">
                <div className="w-[350px] h-[220px] bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-950 text-white rounded-2xl p-4 shadow-2xl relative border border-blue-500/40 flex flex-col justify-between overflow-hidden">
                  {/* Watermark icon */}
                  <CreditCard className="absolute -right-6 -bottom-6 w-36 h-36 text-white/5 pointer-events-none" />

                  {/* Header com Logo ICNV Transparente e Nítida + Congregação (Sem a palavra 'CONGREGAÇÃO') */}
                  <div className="flex items-center justify-between border-b border-white/15 pb-2 z-10">
                    <div className="space-y-0.5">
                      <h3 className="text-[11px] font-black tracking-wider uppercase text-blue-200">IGREJA CRISTÃ NOVA VIDA</h3>
                      <p className="text-[9px] font-extrabold tracking-widest uppercase text-blue-300">
                        {previewMembro.congregacao?.toUpperCase() || 'JARDIM PRIMAVERA'}
                      </p>
                    </div>

                    {/* Logo ICNV sem fundo preto (PNG Transparente de alta resolução) */}
                    <div className="h-10 w-auto flex items-center justify-center shrink-0">
                      <img
                        src="/logo_icnv_transparent.png"
                        alt="Logo ICNV"
                        className="h-10 w-auto object-contain"
                      />
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="flex items-center space-x-3 py-1.5 z-10">
                    {/* Frame da Foto com Zoom e Posição Interativa */}
                    <div className="relative w-16 h-20 rounded-xl bg-slate-900 border-2 border-blue-400/60 overflow-hidden shrink-0 flex items-center justify-center font-bold text-white text-lg shadow-md group">
                      {getFotoUrl(previewMembro.foto) && !imageError ? (
                        <div
                          className="w-full h-full transition-transform duration-75"
                          style={{
                            transform: `scale(${imgZoom}) translate(${imgX}px, ${imgY}px)`
                          }}
                        >
                          <img
                            src={getFotoUrl(previewMembro.foto) || ''}
                            alt=""
                            onError={() => setImageError(true)}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        previewMembro.nome.charAt(0)
                      )}

                      <label className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-white text-[10px] font-bold">
                        <Camera className="w-4 h-4" />
                        <input type="file" accept="image/*" onChange={handleFotoFileChange} className="hidden" />
                      </label>
                    </div>

                    {/* Detalhes do Membro (NOME SEM RETICÊNCIAS, SEM PÍLULA 'MEMBRO', COM DATA BATISMO) */}
                    <div className="space-y-1 min-w-0 flex-1">
                      {/* Nome Completo Sem Truncate / Reticências */}
                      <p className="text-[11px] font-extrabold text-white leading-tight break-words">
                        {previewMembro.nome}
                      </p>

                      {/* Cargo Eclesiástico (Apenas se diferente de Membro) */}
                      {previewMembro.cargo && previewMembro.cargo.toLowerCase() !== 'membro' && (
                        <div>
                          <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-md bg-blue-500/30 text-blue-200 border border-blue-400/40">
                            {previewMembro.cargo}
                          </span>
                        </div>
                      )}

                      <p className="text-[9.5px] text-slate-300 font-medium">
                        Batismo: {formatDateBR(previewMembro.data_batismo)}
                      </p>
                      <p className="text-[8px] text-slate-400">
                        Emissão: {formatDateBR(new Date().toISOString().split('T')[0])}
                      </p>
                    </div>

                    {/* QR Code Placeholder */}
                    <div className="w-10 h-10 bg-white rounded-lg p-1 flex items-center justify-center shrink-0 shadow-sm border border-white/20">
                      <QrCode className="w-full h-full text-slate-900" />
                    </div>
                  </div>

                  {/* Footer Tag */}
                  <div className="text-[7.5px] text-center text-blue-300/80 border-t border-white/10 pt-1 tracking-wider uppercase font-semibold">
                    Documento de Uso Pessoal e Intransferível
                  </div>
                </div>
              </div>

              {/* Painel de Controles de Foto (Upload + Zoom + Arrastar X/Y) */}
              <div className="lg:col-span-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                    <Camera className="w-4 h-4 text-blue-600" />
                    <span>Ajustar Foto do Membro</span>
                  </span>

                  <label className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-semibold cursor-pointer shadow-sm">
                    Alterar Foto
                    <input type="file" accept="image/*" onChange={handleFotoFileChange} className="hidden" />
                  </label>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400 mb-1">
                      <span>Zoom da Foto</span>
                      <span className="font-bold">{Math.round(imgZoom * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="2.5"
                      step="0.05"
                      value={imgZoom}
                      onChange={(e) => setImgZoom(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-500">Mover Horiz. (X)</span>
                      <input
                        type="range"
                        min="-40"
                        max="40"
                        value={imgX}
                        onChange={(e) => setImgX(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500">Mover Vert. (Y)</span>
                      <input
                        type="range"
                        min="-40"
                        max="40"
                        value={imgY}
                        onChange={(e) => setImgY(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => { setImgZoom(1); setImgX(0); setImgY(0); }}
                    className="w-full py-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center space-x-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Redefinir Posição Original</span>
                  </button>
                </div>
              </div>
            </div>

            {/* BARRA DE PROGRESSO DO UPLOAD DA FOTO & CARTEIRINHA */}
            {generating && (
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-xs font-bold text-blue-700 dark:text-blue-400">
                  <span className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span>{uploadStatusMsg}</span>
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-blue-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      )}

      {/* History List Section / Member Card View */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {isMembroOnly ? 'Sua Carteirinha de Membro Emitida' : 'Histórico de Carteirinhas Emitidas'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isMembroOnly ? 'Carteirinha de identificação eclesiástica com QR Code' : 'Lista de carteirinhas geradas com opção de impressão e atualização'}
            </p>
          </div>

          {/* Search - Hidden for Membro */}
          {!isMembroOnly && (
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por nome..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* History Table */}
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : carteirinhasFiltradas.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
            {isMembroOnly ? (
              <div className="space-y-2 max-w-md mx-auto">
                <CreditCard className="w-8 h-8 mx-auto text-blue-500/60" />
                <p className="font-bold text-slate-700 dark:text-slate-300">Carteirinha em Processo de Emissão</p>
                <p className="text-[11px] leading-relaxed">
                  Sua carteirinha está em fase de preparação e processamento pela secretaria da igreja. Assim que a emissão for concluída pelo administrador, o documento estará disponível nesta tela para visualização e impressão.
                </p>
              </div>
            ) : (
              'Nenhuma carteirinha emitida encontrada.'
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Membro</th>
                  <th className="p-3">Congregação</th>
                  <th className="p-3">Data de Emissão</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {carteirinhasFiltradas.map((card) => (
                  <tr key={card.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-300 dark:border-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 text-xs shadow-sm">
                          {card.membro_foto ? (
                            <img src={getFotoUrl(card.membro_foto) || ''} alt="" className="w-full h-full object-cover" />
                          ) : (
                            card.membro_nome?.charAt(0) || 'M'
                          )}
                        </div>
                        <span className="font-bold text-slate-900 dark:text-slate-100">{card.membro_nome}</span>
                      </div>
                    </td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">{card.congregacao || 'Jardim Primavera'}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400 font-medium">{formatDateBR(card.emissao)}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleDownloadPdf(card.id)}
                          disabled={downloadingId === card.id}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm transition-all"
                          title="Imprimir PDF"
                        >
                          {downloadingId === card.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Printer className="w-3.5 h-3.5" />
                          )}
                          <span>Imprimir PDF</span>
                        </button>

                        {!isMembroOnly && (
                          <>
                            <button
                              onClick={() => handleEditCarteirinha(card)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="Editar / Reabrir Modelo"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDeleteCarteirinha(card.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="Cancelar Emissão"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
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
