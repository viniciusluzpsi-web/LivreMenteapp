
import React, { useState } from 'react';
import { Icons } from '../constants';
import { NotificationSettings } from '../types';

interface NotificationPanelProps {
  settings: NotificationSettings;
  onUpdate: (settings: NotificationSettings) => void;
  theme: 'light' | 'dark';
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ settings, onUpdate, theme }) => {
  const isDark = theme === 'dark';
  const [localSettings, setLocalSettings] = useState(settings);

  const handleToggle = (key: keyof NotificationSettings) => {
    const newVal = !localSettings[key];
    const updated = { ...localSettings, [key]: newVal };
    setLocalSettings(updated);
    onUpdate(updated);

    if (newVal) {
      // Solicitar permissão se estiver ativando
      if ("Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission();
      }
    }
  };

  const handleTimeChange = (key: keyof NotificationSettings, val: string) => {
    const updated = { ...localSettings, [key]: val };
    setLocalSettings(updated);
    onUpdate(updated);
  };

  return (
    <div className={`p-8 rounded-[3rem] border theme-transition space-y-8 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-orange-50 shadow-sm'}`}>
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-2xl ${isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-600 text-white'}`}>
          <Icons.Bell className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-xl tracking-tight">Sentinela</h3>
          <p className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-orange-600'}`}>Lembretes Estratégicos</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Habits Reminder */}
        <div className="flex items-center justify-between p-4 rounded-3xl bg-black/5 dark:bg-white/5 border border-transparent hover:border-orange-500/20 transition-all">
          <div className="flex flex-col">
            <span className="text-xs font-bold">Check do Hardware</span>
            <span className="text-[10px] opacity-60">Luz natural, água e sono</span>
          </div>
          <div className="flex items-center gap-4">
            {localSettings.habitsEnabled && (
              <input 
                type="time" 
                className="bg-transparent text-xs font-black uppercase outline-none"
                value={localSettings.habitsTime}
                onChange={(e) => handleTimeChange('habitsTime', e.target.value)}
              />
            )}
            <button 
              onClick={() => handleToggle('habitsEnabled')}
              className={`w-12 h-6 rounded-full relative transition-colors ${localSettings.habitsEnabled ? 'bg-orange-500' : 'bg-slate-500/30'}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${localSettings.habitsEnabled ? 'translate-x-6' : ''}`} />
            </button>
          </div>
        </div>

        {/* Exposure Reminder */}
        <div className="flex items-center justify-between p-4 rounded-3xl bg-black/5 dark:bg-white/5 border border-transparent hover:border-orange-500/20 transition-all">
          <div className="flex flex-col">
            <span className="text-xs font-bold">Escada de Ação</span>
            <span className="text-[10px] opacity-60">Desafios de exposição diária</span>
          </div>
          <div className="flex items-center gap-4">
            {localSettings.exposureEnabled && (
              <input 
                type="time" 
                className="bg-transparent text-xs font-black uppercase outline-none"
                value={localSettings.exposureTime}
                onChange={(e) => handleTimeChange('exposureTime', e.target.value)}
              />
            )}
            <button 
              onClick={() => handleToggle('exposureEnabled')}
              className={`w-12 h-6 rounded-full relative transition-colors ${localSettings.exposureEnabled ? 'bg-orange-500' : 'bg-slate-500/30'}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${localSettings.exposureEnabled ? 'translate-x-6' : ''}`} />
            </button>
          </div>
        </div>

        {/* Reflection Reminder */}
        <div className="flex items-center justify-between p-4 rounded-3xl bg-black/5 dark:bg-white/5 border border-transparent hover:border-orange-500/20 transition-all">
          <div className="flex flex-col">
            <span className="text-xs font-bold">Reflexão TEB</span>
            <span className="text-[10px] opacity-60">Diário e Vitórias do dia</span>
          </div>
          <div className="flex items-center gap-4">
            {localSettings.reflectionEnabled && (
              <input 
                type="time" 
                className="bg-transparent text-xs font-black uppercase outline-none"
                value={localSettings.reflectionTime}
                onChange={(e) => handleTimeChange('reflectionTime', e.target.value)}
              />
            )}
            <button 
              onClick={() => handleToggle('reflectionEnabled')}
              className={`w-12 h-6 rounded-full relative transition-colors ${localSettings.reflectionEnabled ? 'bg-orange-500' : 'bg-slate-500/30'}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${localSettings.reflectionEnabled ? 'translate-x-6' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;
