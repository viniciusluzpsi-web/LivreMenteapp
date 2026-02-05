
import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';

interface SOSModuleProps {
  onClose: () => void;
  theme: 'light' | 'dark';
}

const SOSModule: React.FC<SOSModuleProps> = ({ onClose, theme }) => {
  const isDark = theme === 'dark';
  const [step, setStep] = useState(0);
  const [timer, setTimer] = useState(4);
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Pause'>('Inhale');

  useEffect(() => {
    if (step === 1) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setPhase((curr) => {
              const sequence: Record<string, 'Inhale' | 'Hold' | 'Exhale' | 'Pause'> = {
                'Inhale': 'Hold',
                'Hold': 'Exhale',
                'Exhale': 'Pause',
                'Pause': 'Inhale'
              };
              return sequence[curr];
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step]);

  const steps = [
    {
      title: "Pausa Consciente",
      content: "A ansiedade é apenas energia em movimento. Você não é seus sentimentos, você é quem os observa agora.",
      action: "Estou presente, continuar"
    },
    {
      title: "Respiração Quadrada",
      content: "Siga o guia visual para hackear seu sistema nervoso e restaurar a homeostase.",
      action: "Estou mais calmo, próximo"
    },
    {
      title: "Protocolo 5-4-3-2-1",
      content: "Conecte-se com o real: 5 cores, 4 texturas, 3 sons, 2 aromas, 1 sabor.",
      action: "Consciência ancorada"
    },
    {
      title: "Refresco Biológico",
      content: "Se a ativação for extrema: Água gelada no rosto. O reflexo de mergulho reduz o estresse químico em segundos.",
      action: "Concluir Protocolo"
    }
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[60] flex items-center justify-center p-6 animate-in fade-in duration-500">
      <div className={`rounded-[3.5rem] w-full max-w-md p-12 shadow-2xl relative border overflow-hidden theme-transition ${isDark ? 'bg-[#0a0f1e] border-white/10 text-white' : 'bg-[#fdfbf7] border-orange-100 text-slate-800'}`}>
        
        <div className="absolute top-0 left-0 w-full h-1.5 bg-white/5">
          <div 
            className={`h-full transition-all duration-700 ease-out ${isDark ? 'bg-orange-500' : 'bg-orange-600'}`} 
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        <button onClick={onClose} className="absolute top-10 right-10 text-slate-400 hover:scale-110 transition-transform">
          <Icons.Plus className="rotate-45" />
        </button>

        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <span className={`w-2 h-2 rounded-full animate-pulse ${isDark ? 'bg-orange-500' : 'bg-orange-600'}`} />
            <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>Protocolo de Calma</span>
          </div>
          <h2 className="text-3xl font-bold mb-8 tracking-tight">{steps[step].title}</h2>
          
          <div className="min-h-[200px] flex flex-col justify-center mb-10">
            {step === 1 ? (
              <div className="flex flex-col items-center">
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <div 
                    className={`absolute inset-0 border-4 rounded-full transition-all duration-[4000ms] ease-in-out ${
                      isDark ? 'border-orange-500/20' : 'border-sky-200'
                    } ${
                      phase === 'Inhale' ? 'scale-110 opacity-100' : 
                      phase === 'Exhale' ? 'scale-50 opacity-40' : 
                      'scale-90 opacity-80'
                    }`}
                  />
                  <div className="z-10 text-center">
                    <span className={`text-5xl font-light block mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>{timer}</span>
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                      {phase === 'Inhale' ? 'Inspire' : 
                       phase === 'Hold' ? 'Segure' : 
                       phase === 'Exhale' ? 'Expire' : 'Pausa'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className={`leading-relaxed italic text-xl font-light ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {steps[step].content}
              </p>
            )}
          </div>

          <button
            onClick={() => step < steps.length - 1 ? setStep(step + 1) : onClose()}
            className={`w-full font-black py-6 rounded-[2.5rem] shadow-2xl transition-all active:scale-95 uppercase tracking-widest text-xs ${isDark ? 'bg-orange-500 text-white shadow-orange-950/20' : 'bg-slate-900 text-white shadow-slate-200'}`}
          >
            {steps[step].action}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SOSModule;
