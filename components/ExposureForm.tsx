
import React, { useState, useEffect } from 'react';
import { ExposureStep } from '../types';
import { Icons } from '../constants';

interface ExposureFormProps {
  initialData?: ExposureStep;
  onSave: (step: ExposureStep) => void;
  onClose: () => void;
  theme: 'light' | 'dark';
}

const ExposureForm: React.FC<ExposureFormProps> = ({ initialData, onSave, onClose, theme }) => {
  const isDark = theme === 'dark';
  const [behavior, setBehavior] = useState(initialData?.behavior || '');
  const [rating, setRating] = useState(initialData?.rating || 50);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initialData?.id || Date.now().toString(),
      behavior,
      rating,
      completed: initialData?.completed || false,
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[70] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className={`rounded-[3rem] w-full max-w-md p-10 shadow-2xl border transition-colors ${isDark ? 'bg-[#0a0f1e] border-white/10 text-white' : 'bg-[#fdfbf7] border-orange-100 text-slate-800'}`}>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{initialData ? 'Editar Desafio' : 'Novo Desafio'}</h2>
            <p className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>Escada do Protagonismo</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600">
            <Icons.Plus className="rotate-45" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className={`block text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Ação / Comportamento</label>
            <textarea
              className={`w-full p-5 rounded-[2rem] border outline-none transition-all ${isDark ? 'bg-white/5 border-white/10 focus:border-orange-500/50' : 'bg-white border-sky-100 focus:border-sky-300'}`}
              rows={3}
              placeholder="Ex: Falar com um estranho por 2 minutos..."
              value={behavior}
              onChange={e => setBehavior(e.target.value)}
              required
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className={`block text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Ranking de Desconforto</label>
              <span className={`text-sm font-bold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>{rating} SUDS</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              className="w-full accent-orange-600"
              value={rating}
              onChange={e => setRating(parseInt(e.target.value))}
            />
            <div className="flex justify-between text-[8px] font-bold uppercase tracking-tighter opacity-40">
              <span>Fácil</span>
              <span>Intenso</span>
            </div>
          </div>

          <button
            type="submit"
            className={`w-full font-black py-5 rounded-[2.5rem] shadow-xl transition-all active:scale-95 uppercase tracking-widest text-xs ${isDark ? 'bg-orange-500 text-white shadow-orange-950/20' : 'bg-slate-900 text-white shadow-slate-200'}`}
          >
            Salvar na Escada
          </button>
        </form>
      </div>
    </div>
  );
};

export default ExposureForm;
