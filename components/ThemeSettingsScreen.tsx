import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import type { ColorTheme } from '../types';
import BackIcon from './icons/BackIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';

interface ThemeSettingsScreenProps {
  onBack: () => void;
}

// FIX: Updated theme definitions to match the `ColorTheme` type from `types.ts`.
// The available themes are 'solar' (light) and 'lunar' (dark).
const lightThemes: { id: ColorTheme; name: string; colors: string[] }[] = [
  { id: 'solar', name: 'Solar', colors: ['#f3f4f6', '#1f2937']},
];

const darkThemes: { id: ColorTheme; name: string; colors: string[] }[] = [
  { id: 'lunar', name: 'Lunar', colors: ['#0f172a', '#f1f5f9'] },
];


const ThemeSettingsScreen: React.FC<ThemeSettingsScreenProps> = ({ onBack }) => {
  const { colorTheme, setColorTheme } = useTheme();

  const renderThemeButton = (theme: { id: ColorTheme; name: string; colors: string[] }) => {
      const isSelected = colorTheme === theme.id;
      return (
        <button
          key={theme.id}
          onClick={() => setColorTheme(theme.id)}
          className={`relative p-4 rounded-lg border-2 text-center transition-all duration-200 w-full ${isSelected ? 'border-primary' : 'border-app hover:border-app-hover'}`}
        >
            {isSelected && (
            <div className="absolute top-2 right-2 p-0.5 bg-surface rounded-full">
                <CheckCircleIcon className="w-5 h-5 text-primary" />
            </div>
            )}
            <div className={`w-24 h-16 rounded-md mx-auto mb-3 border-2 shadow-inner`} style={{ backgroundColor: theme.colors[0], borderColor: theme.colors[1]}}></div>
            <p className="font-semibold text-app-text-primary">{theme.name}</p>
        </button>
      )
  }

  return (
    <div className="flex flex-col h-screen bg-app-bg">
      <header className="sticky top-0 z-20 flex items-center justify-between p-4 bg-surface/80 backdrop-blur-sm border-b border-app">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-surface-hover transition-colors">
          <BackIcon className="w-6 h-6 text-app-text-primary" />
        </button>
        <h1 className="text-xl font-bold text-app-text-primary">Appearance Settings</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <div className="bg-surface p-6 rounded-xl shadow-md border border-app">
            <h2 className="text-2xl font-bold text-primary-text-light mb-1">Color Theme</h2>
            <p className="text-app-text-secondary mb-6">Choose a light or dark theme for the application.</p>
            
            <div>
                <h3 className="font-semibold text-app-text-secondary mb-4">Light Themes</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {lightThemes.map(renderThemeButton)}
                </div>
            </div>

            <div className="mt-8">
                <h3 className="font-semibold text-app-text-secondary mb-4">Dark Themes</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {darkThemes.map(renderThemeButton)}
                </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
};

export default ThemeSettingsScreen;