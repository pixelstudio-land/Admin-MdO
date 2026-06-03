import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import MachineForm from './pages/MachineForm';
import CoringaMachine from './pages/CoringaMachine';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col justify-center items-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const hostname = window.location.hostname;
  const isCoringa = hostname.endsWith('.superweb.fun') && !hostname.startsWith('admin.');
  const subdominio = hostname.split('.')[0];
  
  // Developer feature to test Coringa machine locally: http://localhost:5173/?cliente=empresa-xyz
  const queryParams = new URLSearchParams(window.location.search);
  const clienteParam = queryParams.get('cliente');

  if (isCoringa || clienteParam) {
    return <CoringaMachine subdominio={clienteParam || subdominio} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Rota pública */}
        <Route 
          path="/login" 
          element={!session ? <Login /> : <Navigate to="/" replace />} 
        />
        
        {/* Rotas Protegidas */}
        <Route 
          path="/" 
          element={session ? <Layout /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Dashboard />} />
          <Route path="/machine/:id" element={<MachineForm />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
