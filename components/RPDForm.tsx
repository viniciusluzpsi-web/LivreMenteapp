
import React, { useState } from 'react';
import { RPDRecord, DistorcaoCognitiva } from '../types';
import { GeminiTherapist } from '../services/geminiService';
import { Icons } from '../constants';

interface RPDFormProps {
  onSave: (record: RPDRecord) => void;
  onClose: () => void;
  theme: 'light' | 'dark';
}

interface AiFeedback {
  distortions: string;
  reframing: string;
}

const RPDForm: React.FC<RPDFormProps> = ({ onSave, onClose, theme }) => {
  const isDark = theme === 'dark';
  const [loading, setLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<AiFeedback | null>(null);
  const [formData, setFormData] = useState<Omit<RPDRecord, 'id' | 'data'>>({
    situacao: '',
    pensamentoAutomatico: '',
    emocao: '',
    intensidade: 50,
    respostaRacional: '',
    resultado: '',
    distorcao: undefined
  });

  const handleAiAnalyze = async () => {
    if (!formData.pensamentoAutomatico) return;
    setLoading(true);
    setAiFeedback(null);
    try {
      const therapist = new GeminiTherapist();
      const feedback = await therapist.analyzeThought(formData.pensamentoAutomatico);
      if (feedback) {
        setAiFeedback(feedback);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: Date.now().toString(),
      data: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className={`rounded-[3rem] w-full max-w-lg max-h-[90vh] overflow-y-auto p-8 shadow-2xl border transition-colors ${isDark ? 'bg-[#0a0f1e] border-white/10 text-white' : 'bg-[#fdfbf7] border-orange-100 text-slate-800'}`}>
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Registro TEB</h2>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>Hardware Mental</p>
          </div>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isDark ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-400 hover:text-slate-600'}`}>
            <Icons.Plus className="rotate-45" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className={`block text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>1. Situação Contextual</label>
            <textarea
              className={`w-full p-5 rounded-[2rem] border outline-none transition-all ${isDark ? 'bg-white/5 border-white/10 focus:border-orange-500/50' : 'bg-white border-sky-100 focus:border-sky-300'}`}
              rows={2}
              placeholder="Onde? Com quem? O que aconteceu?"
              value={formData.situacao}
              onChange={e => setFormData({...formData, situacao: e.target.value})}
              required
            />
          </div>

          <div className="space-y-3">
            <label className={`block text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>2. Pensamento Automático</label>
            <div className="relative">
              <textarea
                className={`w-full p-5 rounded-[2rem] border outline-none transition-all ${isDark ? 'bg-white/5 border-white/10 focus:border-orange-500/50' : 'bg-white border-sky-100 focus:border-sky-300'}`}
                rows={2}
                placeholder="O que passou pela sua cabeça?"
                value={formData.pensamentoAutomatico}
                onChange={e => setFormData({...formData, pensamentoAutomatico: e.target.value})}
                required
              />
              <button
                type="button"
                onClick={handleAiAnalyze}
                disabled={loading || !formData.pensamentoAutomatico}
                className={`mt-2 text-[9px] font-black flex items-center gap-1.5 hover:opacity-70 disabled:opacity-30 uppercase tracking-widest transition-all ${isDark ? 'text-orange-400' : 'text-orange-600'}`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" /> Analisando...
                  </span>
                ) : (
                  '✨ Analisar com IA Clínica'
                )}
              </button>
            </div>
          </div>

          {aiFeedback && (
            <div className={`p-6 rounded-[2.5rem] border animate-in slide-in-from-top-4 space-y-5 shadow-inner transition-colors ${isDark ? 'bg-white/5 border-white/10' : 'bg-orange-50/50 border-orange-100'}`}>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-600'}`}>
                    <Icons.Brain className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Distorções Identificadas</span>
                </div>
                <p className="text-xs font-bold leading-relaxed pl-1.5">
                  {aiFeedback.distortions}
                </p>
              </div>

              <div className={`h-px w-full ${isDark ? 'bg-white/5' : 'bg-orange-100/60'}`} />

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>
                    <Icons.Leaf className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Sugestão de Reestruturação</span>
                </div>
                <p className="text-xs italic leading-relaxed pl-1.5 text-balance">
                  "{aiFeedback.reframing}"
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <label className={`block text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>3. Rótulo da Distorção</label>
            <select 
              className={`w-full p-5 rounded-[2rem] border outline-none appearance-none ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-sky-100'}`}
              value={formData.distorcao || ''}
              onChange={e => setFormData({...formData, distorcao: e.target.value as DistorcaoCognitiva})}
            >
              <option value="">Nenhuma ou selecionar...</option>
              {Object.values(DistorcaoCognitiva).map(d => (
                <option key={d} value={d} className={isDark ? 'bg-slate-900' : 'bg-white'}>{d}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className={`block text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Emoção</label>
              <input
                type="text"
                className={`w-full p-5 rounded-[2rem] border outline-none ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-sky-100'}`}
                placeholder="Ex: Medo, Culpa"
                value={formData.emocao}
                onChange={e => setFormData({...formData, emocao: e.target.value})}
                required
              />
            </div>
            <div className="space-y-3">
              <label className={`block text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Carga ({formData.intensidade}%)</label>
              <input
                type="range"
                className={`w-full mt-4 accent-orange-600`}
                min="0"
                max="100"
                value={formData.intensidade}
                onChange={e => setFormData({...formData, intensidade: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className={`block text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>4. Resposta Racional</label>
            <textarea
              className={`w-full p-5 rounded-[2rem] border outline-none transition-all ${isDark ? 'bg-white/5 border-white/10 focus:border-orange-500/50' : 'bg-white border-sky-100 focus:border-sky-300'}`}
              rows={2}
              placeholder="O que os fatos dizem de verdade?"
              value={formData.respostaRacional}
              onChange={e => setFormData({...formData, respostaRacional: e.target.value})}
              required
            />
          </div>

          <button
            type="submit"
            className={`w-full font-black py-5 rounded-[2.5rem] shadow-xl transition-all active:scale-95 uppercase tracking-widest text-xs ${isDark ? 'bg-orange-500 text-white shadow-orange-950/20' : 'bg-slate-900 text-white shadow-slate-200'}`}
          >
            Arquivar Registro (+50 XP)
          </button>
        </form>
      </div>
    </div>
  );
};

export default RPDForm;
