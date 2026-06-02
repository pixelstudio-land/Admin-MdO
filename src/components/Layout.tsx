import { Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LayoutDashboard, Settings, LogOut } from 'lucide-react';

export default function Layout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-neutral-950 text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-900 border-r border-white/5 flex flex-col">
        <div className="p-6 border-b border-white/5">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Pixel Admin
          </h1>
          <p className="text-xs text-neutral-500 mt-1">Máquinas de Orçamento</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <a href="/" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg bg-blue-600/10 text-blue-400">
            <LayoutDashboard className="mr-3 h-5 w-5" />
            Dashboard
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-neutral-400 hover:bg-white/5 hover:text-white transition-colors">
            <Settings className="mr-3 h-5 w-5" />
            Configurações
          </a>
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm font-medium rounded-lg text-neutral-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-neutral-950">
        <Outlet />
      </main>
    </div>
  );
}
