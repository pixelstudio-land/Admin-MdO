import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';
import './CoringaStyles.css';

interface CoringaMachineProps {
  subdominio: string;
}

export default function CoringaMachine({ subdominio }: CoringaMachineProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Calculator states
  const [metragem, setMetragem] = useState('');
  const [pisoAtual, setPisoAtual] = useState('');
  const [nivelamento, setNivelamento] = useState('Nao sei');
  const [modeloPreco, setModeloPreco] = useState('');
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [valorFinal, setValorFinal] = useState('R$ 0,00');
  const [linkZap, setLinkZap] = useState('#');

  useEffect(() => {
    async function fetchData() {
      const { data: cliente, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('subdominio', subdominio)
        .single();

      if (error || !cliente) {
        setError(true);
      } else {
        setData(cliente);
        if (cliente.json_opcoes_piso?.length > 0) {
          setPisoAtual(cliente.json_opcoes_piso[0].valor);
        }
        if (cliente.json_pisos?.length > 0) {
          setModeloPreco(cliente.json_pisos[0].preco.toString());
        }
      }
      setLoading(false);
    }
    fetchData();
  }, [subdominio]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-950">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white p-4 text-center">
        <h1 className="text-3xl font-bold mb-2">Máquina não encontrada</h1>
        <p className="text-neutral-400">Verifique se o endereço foi digitado corretamente.</p>
      </div>
    );
  }

  // Set CSS Variables dynamically
  const styleVariables = {
    '--primary': data.cor_primaria || '#CFA257',
    '--secondary': data.cor_secundaria || '#000000',
    '--accent': '#25D366', // WhatsApp green
    '--bg-hero': `url('${data.fundo_url || 'https://images.unsplash.com/photo-1581858326156-313e9a5a3a79?q=80&w=2000'}')`
  } as React.CSSProperties;

  const handleCalculate = () => {
    const met = parseFloat(metragem.replace(',', '.'));
    const preco = parseFloat(modeloPreco);

    if (isNaN(met) || met < 1) {
      alert("Por favor, digite uma metragem válida.");
      return;
    }

    const total = met * preco;
    const formatado = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    setValorFinal(formatado);

    // Get names for WhatsApp
    const pisoAtualTexto = data.json_opcoes_piso?.find((o: any) => o.valor === pisoAtual)?.texto || pisoAtual;
    const modeloSelect = document.getElementById('modelo') as HTMLSelectElement;
    const modeloNome = modeloSelect ? modeloSelect.options[modeloSelect.selectedIndex].text : '';
    const nomeComercialPiso = modeloNome.split('-')[0].trim();
    
    const nivelamentoTexto = nivelamento === 'Nao sei' ? 'Não sei dizer' : nivelamento === 'Sim' ? 'Sim, está reto' : 'Não, está irregular';

    const textoZap = `Olá, ${data.nome_marca1} ${data.nome_marca2}! Fiz uma simulação no site:\n\n` +
      `📐 *Metragem:* ${met}m²\n` +
      `🪵 *Modelo:* ${nomeComercialPiso}\n` +
      `📏 *Rodapé e Acessórios:* Inclusos\n` +
      `💰 *Valor Estimado:* ${formatado}\n\n` +
      `ℹ️ *Local:*\n` +
      `- Atual: ${pisoAtualTexto}\n` +
      `- Nivelamento: ${nivelamentoTexto}\n\n` +
      `Quero agendar visita técnica.`;

    const link = `https://wa.me/${data.whatsapp}?text=${encodeURIComponent(textoZap)}`;
    setLinkZap(link);
    setModalOpen(true);
  };

  // Group floors by category
  const categorias = [...new Set((data.json_pisos || []).map((p: any) => p.categoria))] as string[];

  return (
    <div className="coringa-app" style={styleVariables}>
      <header>
        <div className="container flex">
          <div className="logo">
            {data.logo_url && <img src={data.logo_url} alt="Logo" />}
            <div>{data.nome_marca1} <span>{data.nome_marca2}</span></div>
          </div>
          <a href={`https://wa.me/${data.whatsapp}`} target="_blank" rel="noopener noreferrer" className="btn-zap-header">
            <i className="fab fa-whatsapp"></i> <span>WhatsApp</span>
          </a>
        </div>
      </header>

      <section className="hero">
        <div className="container hero-content">
          <h1>TRANSFORMAMOS SUA CASA EM UM LUGAR <br /> <span>MAIS ACONCHEGANTE</span></h1>
          <p>Faça seu orçamento online em 30 segundos.</p>

          <div className="calculator-box">
            <div className="form-group">
              <label>Qual a metragem aproximada? (m²)</label>
              <input 
                type="number" 
                placeholder="Ex: 45" 
                value={metragem}
                onChange={e => setMetragem(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Piso atual do local?</label>
              <select value={pisoAtual} onChange={e => setPisoAtual(e.target.value)}>
                {(data.json_opcoes_piso || []).map((op: any, i: number) => (
                  <option key={i} value={op.valor}>{op.texto}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>O piso está nivelado?</label>
              <select value={nivelamento} onChange={e => setNivelamento(e.target.value)}>
                <option value="Nao sei">Não sei dizer</option>
                <option value="Sim">Sim, está reto</option>
                <option value="Não">Não, está irregular</option>
              </select>
            </div>

            <div className="form-group">
              <label>Modelo preferido?</label>
              <select id="modelo" value={modeloPreco} onChange={e => setModeloPreco(e.target.value)}>
                {categorias.map(cat => (
                  <optgroup key={cat} label={cat}>
                    {(data.json_pisos || []).filter((p: any) => p.categoria === cat).map((piso: any, i: number) => (
                      <option key={i} value={piso.preco}>
                        {piso.nome} - R$ {piso.preco.toFixed(2).replace('.', ',')}/m²
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <button className="btn-calc" onClick={handleCalculate}>VER PREÇO ESTIMADO</button>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>Por que escolher a <span>{data.nome_marca1} {data.nome_marca2}</span>?</h2>

          <div className="feature-grid">
            <div className="feature-item">
              <i className="fas fa-bolt"></i>
              <h3>Instalação Rápida</h3>
              <p>Equipe rápida e limpa. Entregamos sua obra sem dor de cabeça.</p>
            </div>
            <div className="feature-item">
              <i className="fas fa-medal"></i>
              <h3>Garantia Total</h3>
              <p>Segurança na instalação e nos materiais utilizados.</p>
            </div>
            <div className="feature-item">
              <i className="fas fa-comments-dollar"></i>
              <h3>Negociação Direta</h3>
              <p>Fale diretamente com quem resolve e pague facilitado.</p>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="container footer-row">
          <div className="footer-brand">
            {data.logo_url && <img src={data.logo_url} alt="Logo" />}
            <div>{data.nome_marca1} <span>{data.nome_marca2}</span></div>
          </div>
          <div className="footer-text">
            &copy; Todos os direitos reservados. <span style={{ margin: '0 5px', opacity: 0.3 }}>|</span> Desenvolvido por Pixel Studio
          </div>
        </div>
      </footer>

      {/* MODAL */}
      {modalOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}>
          <div className="modal-content">
            <span className="close-modal" onClick={() => setModalOpen(false)}>&times;</span>

            <h3>Orçamento Estimado</h3>

            <div className="price-display">
              <div className="total-label">Investimento Aproximado</div>
              <div className="total-value">{valorFinal}</div>
            </div>

            <div className="bonus-list">
              <p style={{ marginBottom: '10px', fontWeight: 600 }}>Condições Exclusivas Hoje:</p>
              {(data.json_bonus || []).map((bonus: any, i: number) => (
                <div key={i} className={`bonus-item ${bonus.gratis ? 'free' : ''}`}>
                  <span><i className="fas fa-check"></i> {bonus.titulo}</span>
                  <span>
                    {bonus.strike && <span className="strike">{bonus.strike}</span>}
                    {bonus.subtitulo}
                  </span>
                </div>
              ))}
            </div>

            <a href={linkZap} className="btn-action" target="_blank" rel="noopener noreferrer">
              AGENDAR VISITA <i className="fab fa-whatsapp"></i>
            </a>

            <p className="disclaimer">
              *Valor estimado. Visita técnica necessária para validar.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
