
import React, { useState } from 'react';
import { Icons } from '../constants';

interface OnboardingTutorialProps {
  userName: string;
  onComplete: () => void;
  theme: 'light' | 'dark';
}

const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({ userName, onComplete, theme }) => {
  const isDark = theme === 'dark';
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: `Bem-vindo, ${userName.split(' ')[0]}`,
      subtitle: "Início da Jornada",
      content: "Este não é apenas um app, é seu centro de comando para reestruturação mental e performance biológica.",
      icon: <Icons.Shield className="w-10 h-10" />,
      color: "text-orange-500"
    },
    {
      title: "Hardware Biológico",
      subtitle: "Pilar 01: O Corpo",
      content: "Sua mente não funciona sem o corpo. Registre sono, luz natural e hidratação. Sem hardware, não há software.",
      icon: <Icons.Activity className="w-10 h-10" />,
      color: "text-sky-500"
    },
    {
      title: "Diário TEB",
      subtitle: "Pilar 02: Consciência",
      content: "Mapeie pensamentos automáticos e identifique distorções. A consciência é o primeiro passo para a liberdade.",
      icon: <Icons.Brain className="w-10 h-10" />,
      color: "text-emerald-500"
    },
    {
      title: "Escada de Ação",
      subtitle: "Pilar 03: Exposição",
      content: "Enfrente seus medos através de passos pequenos e calculados. Suba a escada do protagonismo, um degrau por vez.",
      icon: <Icons.Ladder className="w-10 h-10" />,
      color: "text-amber-500"
    },
    {
      title: "Mentor LivreMente",
      subtitle: "Suporte 24/7",
      content: "Sempre que se sentir estagnado ou precisar de uma análise clínica rápida, converse com seu mentor IA.",
      icon: <Icons.Message className="w-10 h-10" />,
      color: "text-indigo-500"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-500">
      <div className={`w-full max-w-sm rounded-[3.5rem] p-10 shadow-2xl border relative overflow-hidden theme-transition ${isDark ? 'bg-[#0a0f1e] border-white/10 text-white' : 'bg-[#fdfbf7] border-orange-100 text-slate-800'}`}>
        
        {/* Progress Dots */}
        <div className="flex gap-1.5 mb-10">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-1 rounded-full transition-all duration-500 ${
                i === currentStep ? 'w-8 bg-orange-500' : 'w-2 bg-slate-500/30'
              }`} 
            />
          ))}
        </div>

        <div className="space-y-8 animate-in slide-in-from-right-8 duration-500" key={currentStep}>
          <div className={`p-5 rounded-[2rem] inline-flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-white shadow-sm'} ${steps[currentStep].color}`}>
            {steps[currentStep].icon}
          </div>

          <div>
            <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-2 ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
              {steps[currentStep].subtitle}
            </p>
            <h2 className="text-4xl font-bold tracking-tight mb-4">
              {steps[currentStep].title}
            </h2>
            <p className={`text-lg leading-relaxed font-light italic ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              "{steps[currentStep].content}"
            </p>
          </div>
        </div>

        <div className="mt-12 space-y-4">
          <button
            onClick={handleNext}
            className={`w-full font-black py-6 rounded-[2rem] shadow-2xl transition-all active:scale-95 uppercase tracking-widest text-[11px] ${
              isDark ? 'bg-orange-500 text-white shadow-orange-950/20' : 'bg-slate-900 text-white shadow-slate-200'
            }`}
          >
            {currentStep === steps.length - 1 ? 'Começar Jornada' : 'Próximo Passo'}
          </button>
          
          <button 
            onClick={onComplete}
            className="w-full py-2 text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
          >
            Pular Tutorial
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTutorial;
