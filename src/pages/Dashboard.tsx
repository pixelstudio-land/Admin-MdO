import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Search, MoreVertical } from 'lucide-react';

export default function Dashboard() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setTenants(data);
    }
    setLoading(false);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Máquinas Ativas</h2>
          <p className="text-neutral-400 text-sm mt-1">Gerencie os clientes da sua Máquina de Orçamentos</p>
        </div>
        <button className="flex items-center bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-blue-600/20">
          <Plus className="w-5 h-5 mr-2" />
          Nova Máquina
        </button>
      </div>

      <div className="bg-neutral-900 border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input 
              type="text"
              placeholder="Buscar cliente..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-neutral-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-400">
            <thead className="bg-neutral-950/50 text-xs uppercase font-semibold text-neutral-300">
              <tr>
                <th className="px-6 py-4">Subdomínio</th>
                <th className="px-6 py-4">Marca</th>
                <th className="px-6 py-4">Cores</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-neutral-500">
                    Carregando clientes...
                  </td>
                </tr>
              ) : tenants.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-neutral-500">
                    Nenhuma máquina cadastrada ainda. Clique em "Nova Máquina" para começar.
                  </td>
                </tr>
              ) : (
                tenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-medium text-white">
                      {tenant.subdominio}.superweb.com
                    </td>
                    <td className="px-6 py-4">
                      {tenant.nome_marca1} <span className="font-bold" style={{color: tenant.cor_primaria}}>{tenant.nome_marca2}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full border border-white/10" style={{backgroundColor: tenant.cor_primaria}}></div>
                        <div className="w-6 h-6 rounded-full border border-white/10" style={{backgroundColor: tenant.cor_secundaria}}></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-neutral-500 hover:text-white p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
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
