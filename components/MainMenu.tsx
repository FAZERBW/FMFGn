import React from 'react';
import type { Screen } from '../types';
import WiperIcon from './icons/WiperIcon';
import BulbIcon from './icons/BulbIcon';
import SettingsIcon from './icons/SettingsIcon';
import ViewIcon from './icons/ViewIcon';
import EditIcon from './icons/EditIcon';
import PaletteIcon from './icons/PaletteIcon';
import LogoutIcon from './icons/LogoutIcon';
import FavoritesIcon from './icons/FavoritesIcon';

interface MainMenuProps {
  onSelectScreen: (screen: Screen) => void;
  isAdmin: boolean;
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onLogout: () => void;
  favoritesCount: number;
}

const FeatureCard: React.FC<{icon: React.ReactNode, title: string, subtitle: string, onClick: () => void, className?: string}> = ({ icon, title, subtitle, onClick, className = '' }) => (
    <button
        onClick={onClick}
        className={`group text-left p-6 bg-app-surface rounded-xl shadow-lg border border-app-border hover:border-primary/50 hover:bg-app-surface-muted transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden ${className}`}
    >
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/5 rounded-full transition-transform duration-500 group-hover:scale-[10]"></div>
        <div className="relative">
            <div className={`p-3 bg-primary-light rounded-lg transition-colors w-max mb-4`}>
                {icon}
            </div>
            <div>
                <h2 className="text-lg font-semibold text-app-text-primary">{title}</h2>
                <p className="text-app-text-secondary text-sm">{subtitle}</p>
            </div>
        </div>
    </button>
);


const MainMenu: React.FC<MainMenuProps> = ({ onSelectScreen, isAdmin, isEditMode, onToggleEditMode, onLogout, favoritesCount }) => {
    
  return (
    <div className="flex flex-col h-full p-4 sm:p-6 bg-transparent">
      <div className="w-full max-w-3xl mx-auto flex-1 flex flex-col justify-center">
        <header className="w-full flex justify-between items-center mb-10">
            <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-app-text-primary tracking-tight">Dashboard</h1>
                <p className="text-md text-app-text-secondary mt-1">Select a guide to begin</p>
            </div>
            {isAdmin && (
                <button 
                    onClick={onLogout} 
                    title="Logout" 
                    className="p-3 bg-app-surface/50 backdrop-blur-sm rounded-full shadow-lg hover:bg-danger-light transition-colors border border-white/10"
                >
                    <LogoutIcon className="w-6 h-6 text-danger" />
                </button>
            )}
        </header>

        <main className="w-full grid grid-cols-2 gap-4">
            <FeatureCard icon={<WiperIcon className="w-8 h-8 text-primary" />} title="Wiper Blade Guide" subtitle="Find wiper blades" onClick={() => onSelectScreen('wipers')} className="col-span-2" />
            <FeatureCard icon={<BulbIcon className="w-8 h-8 text-primary" />} title="HL Bulb Guide" subtitle="Look up bulb types" onClick={() => onSelectScreen('bulbs')} className="col-span-2" />
            
            <FeatureCard icon={<FavoritesIcon className="w-7 h-7 text-primary" />} title="Favorites" subtitle={`${favoritesCount} saved items`} onClick={() => onSelectScreen('favorites')} />
            <FeatureCard icon={<PaletteIcon className="w-7 h-7 text-primary" />} title="Appearance" subtitle="Customize UI" onClick={() => onSelectScreen('appearance_settings')} />

            {isAdmin && <FeatureCard icon={<SettingsIcon className="w-7 h-7 text-primary" />} title="Admin Settings" subtitle="Manage data" onClick={() => onSelectScreen('settings')} className="col-span-2" />}
        </main>

        {isAdmin && (
            <footer className="w-full mt-8">
                <button
                    onClick={onToggleEditMode}
                    className={`w-full flex items-center justify-center gap-3 p-4 rounded-xl shadow-lg border transition-all duration-300 transform hover:-translate-y-1 ${isEditMode ? 'bg-success-light border-green-500/30' : 'bg-app-surface border-app-border hover:border-primary'}`}
                >
                    {isEditMode ? (
                        <>
                            <EditIcon className="w-6 h-6 text-success" />
                            <span className="text-lg font-semibold text-success">Edit Mode Active</span>
                        </>
                    ) : (
                         <>
                            <ViewIcon className="w-6 h-6 text-app-text-secondary" />
                            <span className="text-lg font-semibold text-app-text-primary">View-Only Mode</span>
                        </>
                    )}
                </button>
            </footer>
        )}
      </div>

      <div className="text-center text-app-text-tertiary text-xs pb-4">
        <p>Prince Auto Parts, Dhule Maharashtra</p>
      </div>
    </div>
  );
};

export default MainMenu;