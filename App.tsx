import React, { useState, useEffect, useRef, useCallback } from 'react';
import SplashScreen from './components/SplashScreen';
import LoginScreen from './components/LoginScreen';
import MainMenu from './components/MainMenu';
import GuideScreen from './components/GuideScreen';
import SettingsScreen from './components/SettingsScreen';
import AppearanceSettingsScreen from './components/AppearanceSettingsScreen';
import FavoritesScreen from './components/FavoritesScreen';
import UpdateModal from './components/UpdateModal';
import { useData } from './hooks/useData';
import { useSwipe } from './hooks/useSwipe';
import { useFavorites } from './hooks/useFavorites';
import type { Screen } from './types';

const CURRENT_APP_VERSION = '1.0.0';

type AppState = 'initializing' | 'login' | 'authenticated';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('initializing');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditMode, setIsEditMode] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('main');
  const [animationClass, setAnimationClass] = useState('animate-scale-in');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const appContainerRef = useRef<HTMLDivElement>(null);
  
  const data = useData();
  const favorites = useFavorites();
  
  const navigateTo = useCallback((screen: Screen) => {
    if (screen === currentScreen) return;

    setAnimationClass('animate-slide-out-down');
    setTimeout(() => {
        setCurrentScreen(screen);
        setAnimationClass('animate-slide-in-up');
    }, 300);
  }, [currentScreen]);

  useEffect(() => {
    if (appState === 'initializing' && !data.loading) {
      const timer = setTimeout(() => {
        setAppState('login');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [data.loading, appState]);

  useEffect(() => {
    if (data.appSettings?.latestVersion) {
      const compareVersions = (v1: string, v2: string) => v1.localeCompare(v2, undefined, { numeric: true, sensitivity: 'base' });
      if (compareVersions(data.appSettings.latestVersion, CURRENT_APP_VERSION) > 0) {
        setShowUpdateModal(true);
      }
    }
  }, [data.appSettings]);


  const handleSwipeLeft = useCallback(() => {
    if (currentScreen === 'main') navigateTo('wipers');
  }, [currentScreen, navigateTo]);

  const handleSwipeRight = useCallback(() => {
    if (currentScreen !== 'main') navigateTo('main');
  }, [currentScreen, navigateTo]);

  useSwipe({
    onSwipedLeft: handleSwipeLeft,
    onSwipedRight: handleSwipeRight,
    targetRef: appContainerRef,
  });

  const handleLoginSuccess = (admin: boolean) => {
    setIsAdmin(admin);
    setIsEditMode(admin); // Admins start in edit mode
    setAppState('authenticated');
    setCurrentScreen('main');
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setIsEditMode(false);
    setAppState('login');
    setCurrentScreen('main');
  };

  const renderContent = () => {
    switch (appState) {
      case 'initializing':
        return <SplashScreen loading={data.loading} />;
      
      case 'login':
        return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
      
      case 'authenticated':
        if (data.loading) {
          return <div className="flex items-center justify-center h-screen text-lg font-semibold">Loading...</div>;
        }
        if (data.error) {
          return <div className="flex flex-col items-center justify-center h-screen text-danger text-center p-4"><p className="font-bold">Error:</p><p>{data.error}</p></div>;
        }

        const screenMap: Record<Screen, React.ReactNode> = {
          main: <MainMenu
                    onSelectScreen={navigateTo}
                    isAdmin={isAdmin}
                    isEditMode={isEditMode}
                    onToggleEditMode={() => isAdmin && setIsEditMode(prev => !prev)}
                    onLogout={handleLogout}
                    favoritesCount={favorites.favorites.length}
                />,
          wipers: <GuideScreen title="Wiper Blade Fitting Guide" dataType="wipers" data={data.wipers} headers={['Model', 'Driver', 'Passenger', 'Rear']} onBack={() => navigateTo('main')} isAdmin={isAdmin && isEditMode} {...data} favorites={favorites} />,
          bulbs: <GuideScreen title="HL Bulb Fitting Guide" dataType="bulbs" data={data.bulbs} headers={['Model', 'H/L', 'Low', 'High', 'Fog']} onBack={() => navigateTo('main')} isAdmin={isAdmin && isEditMode} {...data} />,
          favorites: <FavoritesScreen onBack={() => navigateTo('main')} {...favorites} />,
          settings: <SettingsScreen onBack={() => navigateTo('main')} />,
          appearance_settings: <AppearanceSettingsScreen onBack={() => navigateTo('main')} />,
        };
        
        return <div className={animationClass} style={{animationDelay: '0.1s'}}>{screenMap[currentScreen] || screenMap.main}</div>;
      
      default:
        return null;
    }
  };

  return (
    <div ref={appContainerRef} className="h-screen w-screen bg-app-bg text-app-text-primary overflow-hidden font-sans relative">
      <div className="aurora-background"></div>
      {renderContent()}
      {showUpdateModal && data.appSettings && (
        <UpdateModal 
          currentVersion={CURRENT_APP_VERSION}
          settings={data.appSettings}
          onClose={() => setShowUpdateModal(false)}
        />
      )}
    </div>
  );
};

export default App;