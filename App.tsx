
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
  const [activeTab, setActiveTab] = useState<'home' | 'rpd' | 'exposure' | 'progress'>('home');
  const [showRPDForm, setShowRPDForm] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  const [showExposureForm, setShowExposureForm] = useState(false);
  const [xpPopups, setXpPopups] = useState<XpPopup[]>([]);
  const [isLevelingUp, setIsLevelingUp] = useState(false);
  const [isGainingXp, setIsGainingXp] = useState(false);
  
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

  useEffect(() => {
    const savedUser = localStorage.getItem('livremente_current_session');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const uId = currentUser.id;
    const onboardingDone = localStorage.getItem(`user_${uId}_onboarding_done`);
    if (!onboardingDone) setShowTutorial(true);

    const load = (key: string, setter: (val: any) => void) => {
      const data = localStorage.getItem(`user_${uId}_${key}`);
      if (data) setter(JSON.parse(data));
    };

    load('habits', setHabits);
    load('reflection', setReflection);
    load('exposures', setExposures);
    load('rpds', setRpdRecords);
    load('profile', (p) => setUserProfile(p));
  }, [currentUser]);

  const playAchievementSound = (isMajor = false) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = 'sine';
      const freq = isMajor ? 659.25 : 523.25; 
      oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(freq * 1.5, audioCtx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + (isMajor ? 0.8 : 0.4));
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + (isMajor ? 0.8 : 0.4));
    } catch (e) {}
  };

  const addPoints = (amount: number, x?: number, y?: number) => {
    if (!currentUser) return;
    const id = Date.now();
    setXpPopups(prev => [...prev, { id, amount, x: x || window.innerWidth / 2, y: y || window.innerHeight / 2 }]);
    setTimeout(() => setXpPopups(prev => prev.filter(p => p.id !== id)), 1200);

    setIsGainingXp(true);
    setTimeout(() => setIsGainingXp(false), 600);
    playAchievementSound(amount >= 100);

    setUserProfile(prev => {
      let newPoints = prev.points + amount;
      let newLevel = prev.level;
      let newXpToNext = prev.xpToNextLevel;
      let leveledUp = false;

      while (newPoints >= newXpToNext) {
        newPoints -= newXpToNext;
        newLevel += 1;
        newXpToNext = Math.floor(newXpToNext * 1.3);
        leveledUp = true;
      }

      if (leveledUp) {
        setIsLevelingUp(true);
        setTimeout(() => setIsLevelingUp(false), 3000);
      }

      const updated = { ...prev, points: newPoints, level: newLevel, xpToNextLevel: newXpToNext };
      localStorage.setItem(`user_${currentUser.id}_profile`, JSON.stringify(updated));
      return updated;
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('livremente_current_session');
    setActiveTab('home');
  };

  const isDark = theme === 'dark';
  const progressPercent = (userProfile.points / userProfile.xpToNextLevel) * 100;

  if (!currentUser) return <AuthScreen onLogin={u => { setCurrentUser(u); localStorage.setItem('livremente_current_session', JSON.stringify(u)); }} theme={theme} />;

  return (
    <div className={`max-w-md mx-auto min-h-[100dvh] pb-32 relative flex flex-col theme-transition ${isDark ? 'bg-[#0a0f1e] text-white' : 'bg-[#fdfbf7] text-slate-800'} pt-[env(safe-area-inset-top)]`}>
      <div className={`fixed inset-0 leaf-pattern pointer-events-none ${isDark ? 'opacity-[0.02]' : 'opacity-[0.05]'}`} />

      {showTutorial && <OnboardingTutorial userName={currentUser.name} onComplete={() => setShowTutorial(false)} theme={theme} />}

      {xpPopups.map(p => (
        <div key={p.id} className="fixed pointer-events-none z-[100] font-black text-orange-500 animate-xp flex items-center gap-1 text-sm drop-shadow-lg" style={{ left: p.x, top: p.y }}>
          +{p.amount} XP <Icons.Trophy className="w-3 h-3" />
        </div>
      ))}

      {/* HEADER & PROGRESS BAR */}
      <div className={`sticky top-0 z-40 border-b backdrop-blur-xl theme-transition ${isDark ? 'bg-[#0a0f1e]/90 border-white/5' : 'bg-white/80 border-orange-50/50'}`}>
        <header className="px-6 py-4 flex justify-between items-center">
          <img src={LOGO_URL} alt="LivreMente" className="h-8 w-auto" />
          <div className="flex gap-2">
            <button onClick={() => { const n = theme==='light'?'dark':'light'; setTheme(n); localStorage.setItem('theme',n); }} className={`p-2 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-orange-400' : 'bg-sky-50 border-sky-100 text-sky-600'}`}>
              {isDark ? <Icons.Sun className="w-4 h-4" /> : <Icons.Moon className="w-4 h-4" />}
            </button>
            <button onClick={() => setShowSOS(true)} className="px-3 py-2 rounded-xl border font-black text-[9px] uppercase tracking-widest bg-orange-500/10 border-orange-500/20 text-orange-400">SOS</button>
          </div>
        </header>

        {/* Barra de Progresso e Nível */}
        <div className="px-6 pb-4">
          <div className="flex justify-between items-end mb-1.5">
            <div className={`flex items-baseline gap-2 transition-all ${isLevelingUp ? 'scale-110 animate-bounce' : ''}`}>
               <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Nível</span>
               <span className={`text-2xl font-black italic ${isDark ? 'text-orange-400' : 'text-orange-600'} drop-shadow-sm`}>{userProfile.level}</span>
            </div>
            <span className="text-[9px] font-bold opacity-30 uppercase tracking-tighter">{Math.floor(userProfile.points)} XP PARA O PRÓXIMO</span>
          </div>
          <div className={`h-2 w-full rounded-full overflow-hidden relative ${isDark ? 'bg-white/5' : 'bg-orange-100/50'}`}>
            <div 
              className={`h-full transition-all duration-1000 ease-out relative ${isDark ? 'bg-orange-500' : 'bg-orange-600'}`}
              style={{ width: `${progressPercent}%` }}
            >
              {isGainingXp && <div className="absolute inset-0 bg-white/60 animate-pulse" />}
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 p-6 relative z-10 space-y-10 animate-in fade-in duration-1000">
        {activeTab === 'home' && (
          <div className="space-y-10">
            <div className="flex justify-between items-start">
              <div>
                 <h2 className="text-2xl italic font-light">Olá, <span className="font-bold not-italic">{currentUser.name.split(' ')[0]}</span>.</h2>
                 <p className="text-xs opacity-50 font-medium mt-1">Sua biologia hoje:</p>
              </div>
              <button 
                onClick={(e) => addPoints(200, e.clientX, e.clientY)}
                className={`flex flex-col items-center gap-1.5 p-4 rounded-[2rem] border transition-all active:scale-90 group ${isDark ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' : 'bg-orange-50 border-orange-200 text-orange-700'}`}
              >
                <Icons.Calendar className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span className="text-[8px] font-black uppercase tracking-[0.1em]">Consulta do Dia</span>
              </button>
            </div>
            
            <HabitTracker 
              theme={theme}
              status={habits} 
              onToggle={(h, e) => {
                const becomingActive = !habits[h];
                const newH = {...habits, [h]: becomingActive};
                setHabits(newH);
                localStorage.setItem(`user_${currentUser.id}_habits`, JSON.stringify(newH));
                if (becomingActive) addPoints(30, e.clientX, e.clientY);
              }} 
            />

            <section className={`p-8 rounded-[3.5rem] shadow-2xl theme-transition ${isDark ? 'bg-white/5 border border-white/10' : 'bg-slate-900 text-white'}`}>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 rounded-2xl bg-orange-600 text-white shadow-lg shadow-orange-950/40"><Icons.Brain /></div>
                  <h3 className="font-bold text-xl tracking-tight">Vitórias do Dia</h3>
                </div>
                <button onClick={() => {}} className="p-3 rounded-2xl bg-white/10 text-orange-400 hover:scale-110 transition-transform"><Icons.Share className="w-5 h-5" /></button>
              </div>
              <div className="space-y-5">
                {[1, 2, 3].map(i => (
                  <input key={i} type="text" className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-sm outline-none focus:border-orange-500 transition-colors" placeholder={`Vitória ${i}...`} value={(reflection as any)[`vitoria${i}`]} onChange={e => { const r = {...reflection, [`vitoria${i}`]: e.target.value}; setReflection(r); localStorage.setItem(`user_${currentUser.id}_reflection`, JSON.stringify(r)); }} />
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ABAS RPD E EXPOSIÇÃO - Simplificadas aqui para brevidade do HTML, mas funcionais */}
        {activeTab === 'rpd' && (
          <div className="space-y-6">
             <div className="flex justify-between items-end">
                <h2 className="text-3xl font-bold tracking-tight">Diário TEB</h2>
                <button onClick={() => setShowRPDForm(true)} className="w-14 h-14 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-xl active:scale-90 transition-transform"><Icons.Plus /></button>
             </div>
             <div className="space-y-4">
               {rpdRecords.map(r => (
                 <div key={r.id} className={`p-6 rounded-[2.5rem] border ${isDark ? 'bg-white/5 border-white/5' : 'bg-white shadow-sm border-orange-50'}`}>
                   <span className="text-[9px] font-black opacity-30 uppercase">{new Date(r.data).toLocaleDateString()}</span>
                   <h4 className="font-bold text-lg mt-1">{r.emocao}</h4>
                   <p className="text-xs italic opacity-60 line-clamp-2 mt-2">"{r.pensamentoAutomatico}"</p>
                 </div>
               ))}
             </div>
          </div>
        )}

        {activeTab === 'exposure' && (
          <div className="space-y-6">
             <div className="flex justify-between items-end">
                <h2 className="text-3xl font-bold tracking-tight">Ações</h2>
                <button onClick={() => setShowExposureForm(true)} className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform"><Icons.Plus /></button>
             </div>
             <div className="space-y-4">
                {exposures.map(ex => (
                  <div key={ex.id} className={`p-6 rounded-[2.5rem] border flex items-center justify-between ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-sky-50 shadow-sm'}`}>
                    <h4 className={`font-bold text-sm ${ex.completed ? 'line-through opacity-30' : ''}`}>{ex.behavior}</h4>
                    {!ex.completed && (
                      <button onClick={(e) => { addPoints(75, e.clientX, e.clientY); }} className="p-3 rounded-xl bg-orange-500/10 text-orange-500"><Icons.Check className="w-4 h-4" /></button>
                    )}
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-8 pb-20">
            <div className="text-center">
              <div className={`w-28 h-28 rounded-full border-4 flex items-center justify-center mx-auto mb-6 shadow-2xl transition-all ${isLevelingUp ? 'scale-125 border-orange-500 animate-pulse' : (isDark ? 'border-orange-500/30 bg-white/5' : 'border-orange-100 bg-white')}`}>
                <Icons.Trophy className="w-12 h-12 text-orange-500" />
              </div>
              <h2 className="text-4xl font-black italic">Nível {userProfile.level}</h2>
            </div>
            <NotificationPanel theme={theme} settings={notificationSettings} onUpdate={setNotificationSettings} />
            <div className={`p-8 rounded-[3rem] border ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-orange-50'}`}>
               <h4 className="font-bold text-lg mb-6">{currentUser.name}</h4>
               <button onClick={handleLogout} className="w-full py-5 rounded-2xl border border-red-500/20 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-500/5 transition-all">Encerrar Sessão</button>
            </div>
          </div>
        )}
      </main>

      {/* Navegação Inferior */}
      <nav className={`fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md p-3 flex justify-around items-center z-50 rounded-[2.5rem] shadow-2xl border theme-transition ${isDark ? 'bg-slate-900/95 backdrop-blur-2xl border-white/10' : 'bg-white/95 backdrop-blur-2xl border-orange-100'}`}>
        {[
          { id: 'home', icon: <Icons.Activity />, label: 'Início' },
          { id: 'rpd', icon: <Icons.Brain />, label: 'Diário' },
          { id: 'exposure', icon: <Icons.Ladder />, label: 'Desafios' },
          { id: 'progress', icon: <Icons.Trophy />, label: 'Perfil' }
        ].map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`flex flex-col items-center gap-1 transition-all px-4 py-2 rounded-2xl ${activeTab === item.id ? 'text-orange-600 scale-105 bg-orange-500/5' : 'text-slate-400 opacity-60'}`}>
            {item.icon}
            <span className="text-[7px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>

      {showSOS && <SOSModule onClose={() => setShowSOS(false)} theme={theme} />}
      {showRPDForm && <RPDForm theme={theme} onSave={r => { setRpdRecords([r, ...rpdRecords]); localStorage.setItem(`user_${currentUser.id}_rpds`, JSON.stringify([r, ...rpdRecords])); setShowRPDForm(false); addPoints(100); }} onClose={() => setShowRPDForm(false)} />}
      {showExposureForm && <ExposureForm theme={theme} onSave={(s) => { const n = [...exposures, s]; setExposures(n); localStorage.setItem(`user_${currentUser.id}_exposures`, JSON.stringify(n)); setShowExposureForm(false); }} onClose={() => setShowExposureForm(false)} />}
    </div>
  );
};

export default App;
