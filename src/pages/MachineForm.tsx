import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  ArrowLeft, Save, Plus, Trash2, Loader2,
  Building2, Phone, Palette, Image, List, Gift
} from 'lucide-react';

type Piso = { categoria: string; nome: string; preco: number };
type OpcaoPiso = { valor: string; texto: string };
type Bonus = { titulo: string; subtitulo: string; strike: string; gratis: boolean };

const DEFAULT_PISOS: Piso[] = [
  { categoria: 'Laminados', nome: 'Piso Laminado (Completo)', preco: 99.90 },
  { categoria: 'Pisos Vinílicos', nome: 'Piso Vinílico (Completo)', preco: 130.00 },
];
const DEFAULT_OPCOES: OpcaoPiso[] = [
  { valor: 'Contrapiso', texto: 'Contrapiso (Cimento)' },
  { valor: 'Cerâmica', texto: 'Cerâmica / Porcelanato' },
  { valor: 'Madeira', texto: 'Madeira / Taco' },
  { valor: 'Outro', texto: 'Outro / Não sei' },
];
const DEFAULT_BONUS: Bonus[] = [
  { titulo: 'Rodapé e Acessórios', subtitulo: 'INCLUSO', strike: 'R$ 39/m', gratis: true },
  { titulo: 'Cola e Manta', subtitulo: 'INCLUSO', strike: 'R$ 450', gratis: true },
  { titulo: 'Mão de Obra', subtitulo: 'Incluso', strike: '', gratis: false },
];

type Tab = 'dados' | 'cores' | 'pisos' | 'bonus';

export default function MachineForm() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [activeTab, setActiveTab] = useState<Tab>('dados');
  const [success, setSuccess] = useState(false);

  // Form fields
  const [subdominio, setSubdominio] = useState('');
  const [nomeMarca1, setNomeMarca1] = useState('');
  const [nomeMarca2, setNomeMarca2] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [corPrimaria, setCorPrimaria] = useState('#CFA257');
  const [corSecundaria, setCorSecundaria] = useState('#000000');
  const [logoUrl, setLogoUrl] = useState('');
  const [fundoUrl, setFundoUrl] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFundo, setUploadingFundo] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, isLogo: boolean) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (isLogo) setUploadingLogo(true);
    else setUploadingFundo(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${subdominio || 'cliente'}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(filePath);

      if (isLogo) setLogoUrl(publicUrl);
      else setFundoUrl(publicUrl);

    } catch (error: any) {
      alert(`Erro ao fazer upload: ${error.message}`);
    } finally {
      if (isLogo) setUploadingLogo(false);
      else setUploadingFundo(false);
    }
  };
  const [pisos, setPisos] = useState<Piso[]>(DEFAULT_PISOS);
  const [opcoesPiso, setOpcoesPiso] = useState<OpcaoPiso[]>(DEFAULT_OPCOES);
  const [bonus, setBonus] = useState<Bonus[]>(DEFAULT_BONUS);

  useEffect(() => {
    if (!isNew) loadMachine();
  }, [id]);

  const loadMachine = async () => {
    const { data } = await supabase.from('clientes').select('*').eq('id', id).single();
    if (data) {
      setSubdominio(data.subdominio || '');
      setNomeMarca1(data.nome_marca1 || '');
      setNomeMarca2(data.nome_marca2 || '');
      setWhatsapp(data.whatsapp || '');
      setCorPrimaria(data.cor_primaria || '#CFA257');
      setCorSecundaria(data.cor_secundaria || '#000000');
      setLogoUrl(data.logo_url || '');
      setFundoUrl(data.fundo_url || '');
      if (data.json_pisos?.length) setPisos(data.json_pisos);
      if (data.json_opcoes_piso?.length) setOpcoesPiso(data.json_opcoes_piso);
      if (data.json_bonus?.length) setBonus(data.json_bonus);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      subdominio, nome_marca1: nomeMarca1, nome_marca2: nomeMarca2,
      whatsapp, cor_primaria: corPrimaria, cor_secundaria: corSecundaria,
      logo_url: logoUrl, fundo_url: fundoUrl,
      json_pisos: pisos, json_opcoes_piso: opcoesPiso, json_bonus: bonus,
    };
    if (isNew) {
      await supabase.from('clientes').insert([payload]);
    } else {
      await supabase.from('clientes').update(payload).eq('id', id);
    }
    setSaving(false);
    setSuccess(true);
    setTimeout(() => { setSuccess(false); if (isNew) navigate('/'); }, 1500);
  };

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'dados', label: 'Dados da Empresa', icon: Building2 },
    { key: 'cores', label: 'Cores & Imagens', icon: Palette },
    { key: 'pisos', label: 'Pisos & Preços', icon: List },
    { key: 'bonus', label: 'Bônus', icon: Gift },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/')} className="p-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white">
              {isNew ? 'Nova Máquina' : `Editando: ${nomeMarca1} ${nomeMarca2}`}
            </h2>
            <p className="text-neutral-400 text-sm mt-0.5">
              {isNew ? 'Preencha os dados do novo cliente' : `${subdominio}.superweb.fun`}
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || success}
          className={`flex items-center px-5 py-2.5 rounded-lg font-medium transition-all active:scale-95 shadow-lg ${
            success
              ? 'bg-green-600 text-white shadow-green-600/20'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
          }`}
        >
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {success ? 'Salvo!' : saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-neutral-900 border border-white/5 rounded-xl p-1 mb-6">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center flex-1 justify-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === key
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon className="w-4 h-4 mr-2" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab: Dados */}
      {activeTab === 'dados' && (
        <div className="bg-neutral-900 border border-white/5 rounded-2xl p-6 space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-neutral-300 mb-2">Subdomínio</label>
              <div className="flex">
                <input
                  value={subdominio}
                  onChange={e => setSubdominio(e.target.value.toLowerCase().replace(/\s/g, '-'))}
                  placeholder="empresa-xyz"
                  className="flex-1 bg-neutral-950 border border-neutral-700 rounded-l-lg px-4 py-2.5 text-white placeholder-neutral-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
                <span className="bg-neutral-800 border border-l-0 border-neutral-700 rounded-r-lg px-4 py-2.5 text-neutral-400 text-sm">.superweb.fun</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Nome da Marca (parte 1)</label>
              <input value={nomeMarca1} onChange={e => setNomeMarca1(e.target.value)} placeholder="EDU" className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-2.5 text-white placeholder-neutral-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Nome da Marca (parte 2 — em destaque)</label>
              <input value={nomeMarca2} onChange={e => setNomeMarca2(e.target.value)} placeholder="DECOR" className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-2.5 text-white placeholder-neutral-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                <Phone className="inline w-4 h-4 mr-1.5" />WhatsApp (somente números)
              </label>
              <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="5511999999999" className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-2.5 text-white placeholder-neutral-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
            </div>
          </div>
          {/* Live Preview */}
          <div className="mt-4 p-4 bg-neutral-950 rounded-xl border border-white/5">
            <p className="text-xs text-neutral-500 mb-2">Pré-visualização do nome:</p>
            <p className="text-xl font-bold text-white">
              {nomeMarca1 || 'NOME'}{' '}
              <span style={{ color: corPrimaria }}>{nomeMarca2 || 'MARCA'}</span>
            </p>
          </div>
        </div>
      )}

      {/* Tab: Cores */}
      {activeTab === 'cores' && (
        <div className="bg-neutral-900 border border-white/5 rounded-2xl p-6 space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Cor Primária</label>
              <div className="flex items-center space-x-3">
                <input type="color" value={corPrimaria} onChange={e => setCorPrimaria(e.target.value)} className="w-12 h-10 bg-neutral-950 border border-neutral-700 rounded-lg cursor-pointer p-1" />
                <input value={corPrimaria} onChange={e => setCorPrimaria(e.target.value)} className="flex-1 bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-2.5 text-white font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Cor Secundária</label>
              <div className="flex items-center space-x-3">
                <input type="color" value={corSecundaria} onChange={e => setCorSecundaria(e.target.value)} className="w-12 h-10 bg-neutral-950 border border-neutral-700 rounded-lg cursor-pointer p-1" />
                <input value={corSecundaria} onChange={e => setCorSecundaria(e.target.value)} className="flex-1 bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-2.5 text-white font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              <Image className="inline w-4 h-4 mr-1.5" />Logotipo da Empresa
            </label>
            <div className="flex items-center space-x-4 bg-neutral-950 border border-neutral-700 rounded-lg p-2">
              {logoUrl ? (
                <div className="relative">
                  <img src={logoUrl} alt="Logo" className="h-12 w-auto object-contain bg-neutral-800 rounded p-1" />
                  <button onClick={() => setLogoUrl('')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="flex-1 flex items-center justify-center h-12 border border-dashed border-neutral-600 hover:border-blue-500 rounded cursor-pointer transition text-neutral-500 hover:text-blue-500">
                  {uploadingLogo ? <Loader2 className="w-5 h-5 animate-spin" /> : <span className="text-sm">Clique para enviar imagem</span>}
                  <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, true)} disabled={uploadingLogo} />
                </label>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              <Image className="inline w-4 h-4 mr-1.5" />Imagem de Fundo (Hero)
            </label>
            <div className="flex items-center space-x-4 bg-neutral-950 border border-neutral-700 rounded-lg p-2">
              {fundoUrl ? (
                <div className="relative flex-1">
                  <div className="h-24 w-full bg-cover bg-center rounded" style={{ backgroundImage: `url(${fundoUrl})` }}></div>
                  <button onClick={() => setFundoUrl('')} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow hover:bg-red-600 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex-1 flex items-center justify-center h-24 border border-dashed border-neutral-600 hover:border-blue-500 rounded cursor-pointer transition text-neutral-500 hover:text-blue-500">
                  {uploadingFundo ? <Loader2 className="w-5 h-5 animate-spin" /> : <span className="text-sm">Clique para enviar imagem de fundo</span>}
                  <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, false)} disabled={uploadingFundo} />
                </label>
              )}
            </div>
          </div>
          {/* Color Preview */}
          <div className="p-4 rounded-xl overflow-hidden border border-white/5" style={{ background: corSecundaria }}>
            <p className="text-xs opacity-50 mb-2" style={{ color: corPrimaria }}>Pré-visualização das cores:</p>
            <p className="text-lg font-bold" style={{ color: '#ffffff' }}>
              {nomeMarca1 || 'NOME'} <span style={{ color: corPrimaria }}>{nomeMarca2 || 'MARCA'}</span>
            </p>
            <button className="mt-3 px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: corPrimaria }}>
              VER PREÇO ESTIMADO
            </button>
          </div>
        </div>
      )}

      {/* Tab: Pisos */}
      {activeTab === 'pisos' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-white/5 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4">Modelos de Pisos e Preços (por m²)</h3>
            <div className="space-y-3">
              {pisos.map((piso, i) => (
                <div key={i} className="grid grid-cols-12 gap-3 items-center bg-neutral-950 p-3 rounded-xl border border-white/5">
                  <input value={piso.categoria} onChange={e => { const n = [...pisos]; n[i].categoria = e.target.value; setPisos(n); }} placeholder="Categoria" className="col-span-3 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 outline-none focus:border-blue-500" />
                  <input value={piso.nome} onChange={e => { const n = [...pisos]; n[i].nome = e.target.value; setPisos(n); }} placeholder="Nome do Piso" className="col-span-6 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 outline-none focus:border-blue-500" />
                  <div className="col-span-2 flex items-center">
                    <span className="text-neutral-500 text-sm mr-1">R$</span>
                    <input type="number" value={piso.preco} onChange={e => { const n = [...pisos]; n[i].preco = parseFloat(e.target.value); setPisos(n); }} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-2 text-sm text-white outline-none focus:border-blue-500" />
                  </div>
                  <button onClick={() => setPisos(pisos.filter((_, idx) => idx !== i))} className="col-span-1 p-2 text-neutral-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex justify-center">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => setPisos([...pisos, { categoria: '', nome: '', preco: 0 }])} className="mt-3 flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors">
              <Plus className="w-4 h-4 mr-1.5" /> Adicionar Piso
            </button>
          </div>

          <div className="bg-neutral-900 border border-white/5 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4">Opções de Piso Atual</h3>
            <div className="space-y-3">
              {opcoesPiso.map((op, i) => (
                <div key={i} className="grid grid-cols-12 gap-3 items-center bg-neutral-950 p-3 rounded-xl border border-white/5">
                  <input value={op.valor} onChange={e => { const n = [...opcoesPiso]; n[i].valor = e.target.value; setOpcoesPiso(n); }} placeholder="Valor interno" className="col-span-4 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 outline-none focus:border-blue-500" />
                  <input value={op.texto} onChange={e => { const n = [...opcoesPiso]; n[i].texto = e.target.value; setOpcoesPiso(n); }} placeholder="Texto exibido" className="col-span-7 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 outline-none focus:border-blue-500" />
                  <button onClick={() => setOpcoesPiso(opcoesPiso.filter((_, idx) => idx !== i))} className="col-span-1 p-2 text-neutral-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex justify-center">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => setOpcoesPiso([...opcoesPiso, { valor: '', texto: '' }])} className="mt-3 flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors">
              <Plus className="w-4 h-4 mr-1.5" /> Adicionar Opção
            </button>
          </div>
        </div>
      )}

      {/* Tab: Bônus */}
      {activeTab === 'bonus' && (
        <div className="bg-neutral-900 border border-white/5 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">Condições Exibidas no Modal de Resultado</h3>
          <div className="space-y-3">
            {bonus.map((b, i) => (
              <div key={i} className="grid grid-cols-12 gap-3 items-center bg-neutral-950 p-3 rounded-xl border border-white/5">
                <input value={b.titulo} onChange={e => { const n = [...bonus]; n[i].titulo = e.target.value; setBonus(n); }} placeholder="Título" className="col-span-4 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 outline-none focus:border-blue-500" />
                <input value={b.subtitulo} onChange={e => { const n = [...bonus]; n[i].subtitulo = e.target.value; setBonus(n); }} placeholder="Subtítulo (ex: INCLUSO)" className="col-span-3 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 outline-none focus:border-blue-500" />
                <input value={b.strike} onChange={e => { const n = [...bonus]; n[i].strike = e.target.value; setBonus(n); }} placeholder="Preço riscado" className="col-span-2 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 outline-none focus:border-blue-500" />
                <label className="col-span-2 flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" checked={b.gratis} onChange={e => { const n = [...bonus]; n[i].gratis = e.target.checked; setBonus(n); }} className="rounded border-neutral-600 bg-neutral-900 text-blue-600" />
                  <span className="text-xs text-neutral-400">Grátis</span>
                </label>
                <button onClick={() => setBonus(bonus.filter((_, idx) => idx !== i))} className="col-span-1 p-2 text-neutral-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex justify-center">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <button onClick={() => setBonus([...bonus, { titulo: '', subtitulo: '', strike: '', gratis: false }])} className="mt-3 flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors">
            <Plus className="w-4 h-4 mr-1.5" /> Adicionar Condição
          </button>
        </div>
      )}
    </div>
  );
}
