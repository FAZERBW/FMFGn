import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import type { ColorTheme } from '../types';
import BackIcon from './icons/BackIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';

interface AppearanceSettingsScreenProps {
  onBack: () => void;
}

const themes: { id: ColorTheme; name: string; group: 'light' | 'dark' }[] = [
  { id: 'solar', name: 'Solar', group: 'light' },
  { id: 'lunar', name: 'Lunar', group: 'dark' },
];


const AppearanceSettingsScreen: React.FC<AppearanceSettingsScreenProps> = ({ onBack }) => {
  const { colorTheme, setColorTheme } = useTheme();

  return (
    <div className="flex flex-col h-screen bg-transparent">
      <header className="sticky top-0 z-20 flex items-center justify-between p-4 bg-app-bg/50 backdrop-blur-xl border-b border-white/10">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-app-surface-muted transition-colors">
          <BackIcon className="w-6 h-6 text-app-text-primary" />
        </button>
        <h1 className="text-xl font-bold text-app-text-primary">Appearance</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <div className="bg-glass-bg backdrop-blur-xl p-6 rounded-xl shadow-lg border border-white/10">
            <h2 className="text-2xl font-bold text-app-text-primary mb-1">Color Theme</h2>
            <p className="text-app-text-secondary mb-6">Choose a color palette for the application.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {themes.map(theme => {
                const isSelected = colorTheme === theme.id;
                return (
                  <button key={theme.id} onClick={() => setColorTheme(theme.id)} className={`relative p-4 rounded-lg border-2 transition-all ${isSelected ? 'border-primary' : 'border-app-border hover:border-app-border-hover'} theme-${theme.id}`}>
                    {isSelected && (
                      <div className="absolute top-2 right-2 p-0.5 bg-app-surface rounded-full">
                          <CheckCircleIcon className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-full bg-app-bg border-4 border-app-surface-muted flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-primary"></div>
                       </div>
                       <div>
                          <p className="font-semibold text-lg text-app-text-primary text-left">{theme.name}</p>
                          <p className="text-sm text-app-text-secondary text-left">{theme.group === 'light' ? 'Light Mode' : 'Dark Mode'}</p>
                       </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default AppearanceSettingsScreen;