
import React, { useState, useEffect, useRef } from 'react';
import { Icons, LOGO_URL } from './constants';
import { HabitStatus, RPDRecord, DailyReflection, ExposureStep, UserProfile, User, NotificationSettings } from './types';
import HabitTracker from './components/HabitTracker';
import RPDForm from './components/RPDForm';
import SOSModule from './components/SOSModule';
import ExposureForm from './components/ExposureForm';
import AuthScreen from './components/AuthScreen';
import OnboardingTutorial from './components/OnboardingTutorial';
import NotificationPanel from './components/NotificationPanel';
import { GeminiTherapist } from './services/geminiService';

interface XpPopup {
  id: number;
  amount: number;
  x: number;
  y: number;
}

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeTab, setActiveTab] = useState<'home' | 'rpd' | 'exposure' | 'chat' | 'progress'>('home');
  const [showRPDForm, setShowRPDForm] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  const [editingExposure, setEditingExposure] = useState<ExposureStep | null>(null);
  const [showExposureForm, setShowExposureForm] = useState(false);
  const [xpPopups, setXpPopups] = useState<XpPopup[]>([]);
  const lastLevelRef = useRef(1);
  const notificationCheckRef = useRef<number | null>(null);
  
  const [habits, setHabits] = useState<HabitStatus>({
    sono: false, nutricao: false, exercicio: false, mindfulness: false, luzNatural: false, hidratacao: false
  });

  const [exposures, setExposures] = useState<ExposureStep[]>([]);
  const [rpdRecords, setRpdRecords] = useState<RPDRecord[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    points: 0,
    level: 1,
    xpToNextLevel: 500,
    badges: []
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    habitsEnabled: true,
    habitsTime: '08:00',
    exposureEnabled: true,
    exposureTime: '14:00',
    reflectionEnabled: true,
    reflectionTime: '21:00'
  });

  const [reflection, setReflection] = useState<DailyReflection>({
    gratidao: '',
    vitoria1: '',
    vitoria2: '',
    vitoria3: ''
  });

  const [chatMessage, setChatMessage] = useState('');
  const [chatLog, setChatLog] = useState<{ role: string; content: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('livremente_current_session');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) setTheme(savedTheme);
  }, []);

  // Otimização para Mobile: Prevenir zoom acidental em toques duplos
  useEffect(() => {
    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
    };
    document.addEventListener('touchstart', preventZoom, { passive: false });
    return () => document.removeEventListener('touchstart', preventZoom);
  }, []);

  useEffect(() => {
    if (!currentUser) {
      if (notificationCheckRef.current) clearInterval(notificationCheckRef.current);
      return;
    }

    const checkReminders = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const sendNotify = (title: string, body: string) => {
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(title, { body, icon: LOGO_URL });
        }
      };

      if (notificationSettings.habitsEnabled && currentTime === notificationSettings.habitsTime && now.getSeconds() < 10) {
        sendNotify("LivreMente: Hardware Biológico", "Hora de registrar seus hábitos matinais.");
      }
      if (notificationSettings.reflectionEnabled && currentTime === notificationSettings.reflectionTime && now.getSeconds() < 10) {
        sendNotify("LivreMente: Reflexão do Dia", "Dia terminando... Que tal registrar suas 3 vitórias?");
      }
    };

    notificationCheckRef.current = window.setInterval(checkReminders, 10000);
    return () => { if (notificationCheckRef.current) clearInterval(notificationCheckRef.current); };
  }, [currentUser, notificationSettings]);

  useEffect(() => {
    if (!currentUser) return;
    const uId = currentUser.id;
    
    const onboardingDone = localStorage.getItem(`user_${uId}_onboarding_done`);
    if (!onboardingDone) setShowTutorial(true);

    const savedHabits = localStorage.getItem(`user_${uId}_habits`);
    if (savedHabits) setHabits(JSON.parse(savedHabits));
    
    const savedRef = localStorage.getItem(`user_${uId}_reflection`);
    if (savedRef) setReflection(JSON.parse(savedRef));

    const savedExposures = localStorage.getItem(`user_${uId}_exposures`);
    if (savedExposures) setExposures(JSON.parse(savedExposures));

    const savedRPDs = localStorage.getItem(`user_${uId}_rpds`);
    if (savedRPDs) setRpdRecords(JSON.parse(savedRPDs));

    const savedProfile = localStorage.getItem(`user_${uId}_profile`);
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setUserProfile(parsed);
      lastLevelRef.current = parsed.level;
    }
  }, [currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('livremente_current_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('livremente_current_session');
    setActiveTab('home');
  };

  const addPoints = (amount: number, x?: number, y?: number) => {
    if (!currentUser) return;
    const id = Date.now();
    setXpPopups(prev => [...prev, { id, amount, x: x || 200, y: y || 400 }]);
    setTimeout(() => setXpPopups(prev => prev.filter(p => p.id !== id)), 1200);

    setUserProfile(prev => {
      let newPoints = prev.points + amount;
      let newLevel = prev.level;
      let newXpToNext = prev.xpToNextLevel;
      while (newPoints >= newXpToNext) {
        newPoints -= newXpToNext;
        newLevel += 1;
        newXpToNext = Math.floor(newXpToNext * 1.2);
      }
      const updated = { ...prev, points: newPoints, level: newLevel, xpToNextLevel: newXpToNext };
      localStorage.setItem(`user_${currentUser.id}_profile`, JSON.stringify(updated));
      return updated;
    });
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const saveReflection = (data: Partial<DailyReflection>) => {
    if (!currentUser) return;
    const newRef = { ...reflection, ...data };
    setReflection(newRef);
    localStorage.setItem(`user_${currentUser.id}_reflection`, JSON.stringify(newRef));
  };

  const handleSaveExposure = (step: ExposureStep) => {
    if (!currentUser) return;
    const newExposures = exposures.find(e => e.id === step.id) 
      ? exposures.map(e => e.id === step.id ? step : e)
      : [...exposures, step];
    newExposures.sort((a, b) => a.rating - b.rating);
    setExposures(newExposures);
    localStorage.setItem(`user_${currentUser.id}_exposures`, JSON.stringify(newExposures));
    setShowExposureForm(false);
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;
    const userMsg = chatMessage;
    setChatMessage('');
    setChatLog(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);
    try {
      const therapist = new GeminiTherapist();
      const response = await therapist.chat(userMsg);
      setChatLog(prev => [...prev, { role: 'model', content: response || 'Houve um erro.' }]);
      addPoints(5); 
    } catch (error) {
      setChatLog(prev => [...prev, { role: 'model', content: 'Erro de conexão.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleShareVictories = () => {
    const { vitoria1, vitoria2, vitoria3 } = reflection;
    const text = `🏆 Minhas 3 Vitórias (LivreMente):\n1️⃣ ${vitoria1 || '-'}\n2️⃣ ${vitoria2 || '-'}\n3️⃣ ${vitoria3 || '-'}\n\n🧠 @viniciusluz_psicologo`;
    if (navigator.share) {
      navigator.share({ title: 'Minhas Vitórias', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert("Copiado!");
    }
  };

  if (!currentUser) return <AuthScreen onLogin={handleLogin} theme={theme} />;

  const isDark = theme === 'dark';

  return (
    <div className={`max-w-md mx-auto min-h-[100dvh] pb-32 relative flex flex-col theme-transition ${isDark ? 'bg-[#0a0f1e] text-white' : 'bg-[#fdfbf7] text-slate-800'} overflow-x-hidden pt-[env(safe-area-inset-top)]`}>
      <div className={`fixed inset-0 leaf-pattern pointer-events-none ${isDark ? 'opacity-[0.02]' : 'opacity-[0.05]'}`} />

      {showTutorial && <OnboardingTutorial userName={currentUser.name} onComplete={() => setShowTutorial(false)} theme={theme} />}

      {xpPopups.map(p => (
        <div key={p.id} className="fixed pointer-events-none z-[100] font-black text-orange-500 animate-xp flex items-center gap-1 text-sm" style={{ left: p.x, top: p.y }}>
          +{p.amount} XP <Icons.Trophy className="w-3 h-3" />
        </div>
      ))}

      <header className={`px-6 py-6 sticky top-0 z-40 border-b backdrop-blur-xl theme-transition ${isDark ? 'bg-[#0a0f1e]/90 border-white/5' : 'bg-white/80 border-orange-50/50'} flex justify-between items-center`}>
        <img src={LOGO_URL} alt="LivreMente" className="h-10 w-auto object-contain" />
        <div className="flex gap-2">
          <button onClick={toggleTheme} className={`p-2 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-orange-400' : 'bg-sky-50 border-sky-100 text-sky-600'}`}>
            {isDark ? <Icons.Sun className="w-4 h-4" /> : <Icons.Moon className="w-4 h-4" />}
          </button>
          <button onClick={() => setShowSOS(true)} className={`px-3 py-2 rounded-xl border font-black text-[9px] uppercase tracking-widest ${isDark ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' : 'bg-orange-50 border-orange-100 text-orange-700'}`}>SOS</button>
        </div>
      </header>

      <main className="flex-1 p-6 relative z-10 space-y-8 animate-in fade-in duration-700">
        {activeTab === 'home' && (
          <div className="space-y-10">
            <div>
               <h2 className="text-2xl italic font-light">Olá, <span className="font-bold not-italic">{currentUser.name.split(' ')[0]}</span>.</h2>
               <p className="text-xs opacity-60 font-medium">Hardware Biológico:</p>
            </div>
            <HabitTracker 
              theme={theme}
              status={habits} 
              onToggle={(h, e) => {
                const becomingActive = !habits[h];
                const newH = {...habits, [h]: becomingActive};
                setHabits(newH);
                localStorage.setItem(`user_${currentUser.id}_habits`, JSON.stringify(newH));
                if (becomingActive) addPoints(15, e.clientX, e.clientY);
              }} 
            />
            <section className={`p-8 rounded-[3rem] shadow-xl overflow-hidden relative theme-transition ${isDark ? 'bg-white/5 border border-white/10' : 'bg-slate-900 text-white'}`}>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-600 text-white'}`}><Icons.Brain /></div>
                  <h3 className="font-bold text-xl">Neuroplasticidade</h3>
                </div>
                <button onClick={handleShareVictories} className="p-3 rounded-2xl bg-white/10 text-orange-400 hover:scale-110 transition-transform"><Icons.Share className="w-5 h-5" /></button>
              </div>
              <div className="space-y-6">
                <input type="text" className="w-full rounded-2xl p-4 text-sm bg-white/5 border border-white/10 text-white outline-none focus:border-orange-500" placeholder="Gratidão de hoje..." value={reflection.gratidao} onChange={e => saveReflection({ gratidao: e.target.value })} />
                <div className="space-y-4">
                  <p className="text-[10px] uppercase font-bold tracking-widest opacity-50">3 Vitórias (Elephant Training)</p>
                  {[1, 2, 3].map(i => (
                    <input key={i} type="text" className="w-full bg-transparent border-b border-white/10 py-2 text-sm outline-none focus:border-orange-500 text-white" placeholder={`Vitória ${i}...`} value={(reflection as any)[`vitoria${i}`]} onChange={e => saveReflection({ [`vitoria${i}`]: e.target.value })} />
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'rpd' && (
          <div className="space-y-8">
             <div className="flex justify-between items-end">
                <h2 className="text-3xl font-bold">Diário TEB</h2>
                <button onClick={() => setShowRPDForm(true)} className="w-14 h-14 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-lg"><Icons.Plus /></button>
             </div>
             {rpdRecords.length === 0 ? (
               <div className="p-12 text-center opacity-30"><Icons.Brain className="w-16 h-16 mx-auto mb-4" /><p>Mapeie seus pensamentos.</p></div>
             ) : (
               <div className="space-y-4">
                 {rpdRecords.map(r => (
                   <div key={r.id} className={`p-6 rounded-[2.5rem] border ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-orange-100'}`}>
                     <div className="flex justify-between"><span className="text-[9px] font-black opacity-40 uppercase">{new Date(r.data).toLocaleDateString()}</span></div>
                     <h4 className="font-bold text-lg">{r.emocao} ({r.intensidade}%)</h4>
                     <p className="text-xs italic opacity-80 mt-2">"{r.pensamentoAutomatico}"</p>
                   </div>
                 ))}
               </div>
             )}
          </div>
        )}

        {activeTab === 'exposure' && (
          <div className="space-y-8">
             <div className="flex justify-between items-end">
                <h2 className="text-3xl font-bold">Exposição</h2>
                <button onClick={() => setShowExposureForm(true)} className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center"><Icons.Plus /></button>
             </div>
             <div className="space-y-4">
                {exposures.map(ex => (
                  <div key={ex.id} className={`p-6 rounded-[2.5rem] border ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-sky-50'}`}>
                    <h4 className={`font-bold ${ex.completed ? 'line-through opacity-40' : ''}`}>{ex.behavior}</h4>
                    <button onClick={(e) => { addPoints(50, e.clientX, e.clientY); }} className="mt-4 text-[10px] font-black uppercase tracking-widest text-orange-600">Validar Conquista</button>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="flex flex-col h-[65dvh]">
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              <div className="flex justify-start"><div className={`p-5 rounded-3xl rounded-tl-none text-xs max-w-[80%] ${isDark ? 'bg-white/5 text-slate-300' : 'bg-sky-50 text-sky-800'}`}>Olá. Como podemos alinhar sua biologia e pensamentos agora?</div></div>
              {chatLog.map((msg, i) => (<div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] p-5 rounded-3xl text-xs ${msg.role === 'user' ? (isDark ? 'bg-orange-500 rounded-tr-none' : 'bg-slate-900 text-white rounded-tr-none') : (isDark ? 'bg-white/5 text-slate-300 rounded-tl-none' : 'bg-white border border-sky-100 rounded-tl-none')}`}>{msg.content}</div></div>))}
              {isTyping && <div className="flex gap-1 ml-4"><div className="w-1 h-1 bg-orange-500 rounded-full animate-bounce" /></div>}
            </div>
            <div className={`mt-4 flex gap-2 p-2 rounded-full border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-sky-50'}`}>
              <input type="text" className="flex-1 px-5 py-3 bg-transparent outline-none text-sm" placeholder="Mandar mensagem..." value={chatMessage} onChange={e => setChatMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendMessage()} />
              <button onClick={handleSendMessage} className="w-12 h-12 rounded-full bg-orange-600 text-white flex items-center justify-center"><Icons.Message className="w-5 h-5" /></button>
            </div>
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-10">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full border-4 border-orange-500/30 bg-orange-500/10 flex items-center justify-center mx-auto mb-4"><Icons.Trophy className="w-10 h-10 text-orange-500" /></div>
              <h2 className="text-3xl font-black italic">Nível {userProfile.level}</h2>
            </div>
            <NotificationPanel theme={theme} settings={notificationSettings} onUpdate={setNotificationSettings} />
            <div className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-orange-100'}`}>
               <h4 className="font-bold mb-4">{currentUser.name}</h4>
               <button onClick={handleLogout} className="w-full py-4 rounded-xl border border-red-500/20 text-red-500 font-black text-[10px] uppercase">Encerrar Sessão</button>
            </div>
          </div>
        )}
      </main>

      <nav className={`fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md p-3 flex justify-around items-center z-50 rounded-[2.5rem] shadow-2xl border theme-transition ${isDark ? 'bg-slate-900/95 backdrop-blur-2xl border-white/10' : 'bg-white/95 backdrop-blur-2xl border-orange-100'}`}>
        {[
          { id: 'home', icon: <Icons.Activity />, label: 'Check' },
          { id: 'rpd', icon: <Icons.Brain />, label: 'Diário' },
          { id: 'exposure', icon: <Icons.Ladder />, label: 'Ação' },
          { id: 'progress', icon: <Icons.Trophy />, label: 'Perfil' },
          { id: 'chat', icon: <Icons.Message />, label: 'Mentor' }
        ].map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`flex flex-col items-center gap-1 transition-all ${activeTab === item.id ? 'text-orange-600 scale-110' : 'text-slate-500 opacity-60'}`}>
            {item.icon}
            <span className="text-[7px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>

      {showSOS && <SOSModule onClose={() => setShowSOS(false)} theme={theme} />}
      {showRPDForm && <RPDForm theme={theme} onSave={r => { setRpdRecords([r, ...rpdRecords]); setShowRPDForm(false); addPoints(50); }} onClose={() => setShowRPDForm(false)} />}
      {showExposureForm && <ExposureForm theme={theme} onSave={handleSaveExposure} onClose={() => setShowExposureForm(false)} />}
    </div>
  );
};

export default App;
