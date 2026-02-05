
import React from 'react';
import { Icons } from '../constants';
import { HabitStatus } from '../types';

interface HabitTrackerProps {
  status: HabitStatus;
  onToggle: (habit: keyof HabitStatus, e: React.MouseEvent) => void;
  theme: 'light' | 'dark';
}

const HabitTracker: React.FC<HabitTrackerProps> = ({ status, onToggle, theme }) => {
  const isDark = theme === 'dark';
  const habits = [
    { id: 'luzNatural', label: 'Luz Natural', icon: <Icons.Sun /> },
    { id: 'hidratacao', label: 'Hidratação', icon: <Icons.Droplets /> },
    { id: 'sono', label: 'Sono Reparador', icon: <Icons.Moon /> },
    { id: 'exercicio', label: 'Movimento', icon: <Icons.Activity /> },
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-4">
      {habits.map((habit) => (
        <button
          key={habit.id}
          onClick={(e) => onToggle(habit.id, e)}
          className={`group relative flex flex-col items-center justify-center p-6 rounded-[2.5rem] transition-all duration-500 border overflow-hidden ${
            status[habit.id] 
              ? (isDark ? 'bg-orange-500/10 border-orange-500/30 text-orange-400 shadow-sm shadow-orange-950/20' : 'bg-sky-100 border-sky-200 text-sky-800 shadow-sm') 
              : (isDark ? 'bg-white/5 border-white/5 text-slate-500 hover:border-orange-500/30 hover:bg-orange-500/5' : 'bg-white border-slate-100 text-slate-400 hover:border-sky-100 hover:bg-sky-50/50')
          }`}
        >
          {status[habit.id] && (
            <div className={`absolute top-3 right-3 animate-in fade-in zoom-in ${isDark ? 'text-orange-400' : 'text-sky-600'}`}>
              <Icons.Check />
            </div>
          )}
          <div className={`mb-3 transition-transform duration-500 group-hover:scale-110 ${status[habit.id] ? (isDark ? 'text-orange-400' : 'text-sky-700') : 'opacity-40'}`}>
            {habit.icon}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-center">
            {habit.label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default HabitTracker;
