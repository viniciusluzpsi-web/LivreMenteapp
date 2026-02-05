
import React, { useState } from 'react';
import { Icons, LOGO_URL } from '../constants';
import { User } from '../types';

interface AuthScreenProps {
  onLogin: (user: User) => void;
  theme: 'light' | 'dark';
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, theme }) => {
  const isDark = theme === 'dark';
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulação de delay de rede
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Mock Database Logic
    const usersJson = localStorage.getItem('livremente_users') || '[]';
    const users = JSON.parse(usersJson) as (User & { password: string })[];

    if (mode === 'signup') {
      if (users.find(u => u.email === email)) {
        alert("Email já cadastrado.");
        setLoading(false);
        return;
      }
      const newUser = { id: Date.now().toString(), email, name, password };
      users.push(newUser);
      localStorage.setItem('livremente_users', JSON.stringify(users));
      onLogin({ id: newUser.id, email: newUser.email, name: newUser.name });
    } else {
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        onLogin({ id: user.id, email: user.email, name: user.name });
      } else {
        alert("Credenciais inválidas.");
      }
    }
    setLoading(false);
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center p-8 theme-transition ${isDark ? 'bg-[#0a0f1e] text-white' : 'bg-[#fdfbf7] text-slate-800'}`}>
      <div className="fixed inset-0 leaf-pattern opacity-[0.05] pointer-events-none" />
      
      <div className="w-full max-w-sm z-10 space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="text-center">
          <img 
            src={LOGO_URL} 
            alt="LivreMENTE - Psicólogo Vinícius Luz" 
            className="w-full max-w-[320px] mx-auto drop-shadow-2xl brightness-110" 
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {mode === 'signup' && (
            <div className="space-y-2">
              <label className={`text-[10px] uppercase font-black tracking-widest pl-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Nome Completo</label>
              <input 
                type="text" 
                required 
                className={`w-full p-5 rounded-[1.5rem] outline-none border transition-all ${isDark ? 'bg-white/5 border-white/10 focus:border-orange-500/50' : 'bg-white border-orange-50 focus:border-orange-200'}`} 
                placeholder="Seu nome..." 
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <label className={`text-[10px] uppercase font-black tracking-widest pl-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Email</label>
            <input 
              type="email" 
              required 
              className={`w-full p-5 rounded-[1.5rem] outline-none border transition-all ${isDark ? 'bg-white/5 border-white/10 focus:border-orange-500/50' : 'bg-white border-orange-50 focus:border-orange-200'}`} 
              placeholder="seu@email.com" 
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className={`text-[10px] uppercase font-black tracking-widest pl-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Senha</label>
            <input 
              type="password" 
              required 
              className={`w-full p-5 rounded-[1.5rem] outline-none border transition-all ${isDark ? 'bg-white/5 border-white/10 focus:border-orange-500/50' : 'bg-white border-orange-50 focus:border-orange-200'}`} 
              placeholder="••••••••" 
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] shadow-2xl transition-all active:scale-95 disabled:opacity-50 ${isDark ? 'bg-orange-500 text-white' : 'bg-slate-900 text-white'}`}
          >
            {loading ? 'Processando...' : mode === 'login' ? 'Entrar no Protagonismo' : 'Começar Jornada'}
          </button>
        </form>

        <div className="text-center">
          <button 
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className={`text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity`}
          >
            {mode === 'login' ? 'Não tem conta? Criar conta' : 'Já tem conta? Fazer Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
