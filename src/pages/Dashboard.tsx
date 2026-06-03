import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Plus, Search, MoreVertical, Edit2, Trash2, ExternalLink, Globe } from 'lucide-react';

export default function Dashboard() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTenants();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchTenants = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setTenants(data);
    setLoading(false);
  };

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que quer excluir a máquina "${nome}"? Essa ação não pode ser desfeita.`)) return;
    setDeleting(id);
    await supabase.from('clientes').delete().eq('id', id);
    setTenants(prev => prev.filter(t => t.id !== id));
    setDeleting(null);
    setOpenMenu(null);
  };

  const filtered = tenants.filter(t =>
    t.subdominio?.toLowerCase().includes(search.toLowerCase()) ||
    t.nome_marca1?.toLowerCase().includes(search.toLowerCase()) ||
    t.nome_marca2?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Máquinas Ativas</h2>
          <p className="text-neutral-400 text-sm mt-1">
            {tenants.length} {tenants.length === 1 ? 'cliente cadastrado' : 'clientes cadastrados'}
          </p>
        </div>
        <button
          onClick={() => navigate('/machine/new')}
          className="flex items-center bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 active:scale-95"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nova Máquina
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-neutral-900 border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-neutral-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
            />
          </div>
          <span className="text-xs text-neutral-500">{filtered.length} resultado(s)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-400">
            <thead className="bg-neutral-950/50 text-xs uppercase font-semibold text-neutral-300">
              <tr>
                <th className="px-6 py-4">Subdomínio</th>
                <th className="px-6 py-4">Marca</th>
                <th className="px-6 py-4">WhatsApp</th>
                <th className="px-6 py-4">Cores</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center space-x-2 text-neutral-500">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <span>Carregando...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center space-y-3 text-neutral-600">
                      <Globe className="w-10 h-10" />
                      <p className="font-medium text-neutral-400">Nenhuma máquina encontrada</p>
                      <p className="text-sm">Clique em "Nova Máquina" para começar.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 font-medium text-white">
                      <div className="flex items-center space-x-2">
                        <span>{tenant.subdominio}.superweb.fun</span>
                        <a
                          href={`http://${tenant.subdominio}.superweb.fun`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-500 hover:text-blue-400"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-neutral-300">{tenant.nome_marca1} </span>
                      <span className="font-bold" style={{ color: tenant.cor_primaria || '#CFA257' }}>
                        {tenant.nome_marca2}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-neutral-500">
                      {tenant.whatsapp || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1.5">
                        <div
                          className="w-5 h-5 rounded-full border border-white/10 shadow-inner"
                          style={{ backgroundColor: tenant.cor_primaria || '#CFA257' }}
                          title={tenant.cor_primaria}
                        />
                        <div
                          className="w-5 h-5 rounded-full border border-white/10 shadow-inner"
                          style={{ backgroundColor: tenant.cor_secundaria || '#000000' }}
                          title={tenant.cor_secundaria}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button
                        onClick={() => setOpenMenu(openMenu === tenant.id ? null : tenant.id)}
                        className="text-neutral-500 hover:text-white p-2 hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {openMenu === tenant.id && (
                        <div ref={menuRef} className="absolute right-4 top-full mt-1 w-44 bg-neutral-800 border border-white/10 rounded-xl shadow-2xl z-50 py-1 overflow-hidden">
                          <button
                            onClick={() => { navigate(`/machine/${tenant.id}`); setOpenMenu(null); }}
                            className="flex items-center w-full px-4 py-2.5 text-sm text-neutral-300 hover:bg-white/5 hover:text-white transition-colors"
                          >
                            <Edit2 className="w-4 h-4 mr-3 text-blue-400" />
                            Editar
                          </button>
                          <div className="my-1 border-t border-white/5" />
                          <button
                            onClick={() => handleDelete(tenant.id, `${tenant.nome_marca1} ${tenant.nome_marca2}`)}
                            disabled={deleting === tenant.id}
                            className="flex items-center w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4 mr-3" />
                            {deleting === tenant.id ? 'Excluindo...' : 'Excluir'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
