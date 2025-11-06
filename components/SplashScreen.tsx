import React, { useState, useEffect } from 'react';
import ShineIcon from './icons/ShineIcon';

interface SplashScreenProps {
  loading: boolean;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ loading }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let progressInterval: number;
    if (loading) {
      setProgress(10);
      progressInterval = window.setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          const increment = (100 - prev) / 20;
          return prev + Math.max(0.2, increment);
        });
      }, 50);
    } else {
      setProgress(100);
    }
    return () => clearInterval(progressInterval);
  }, [loading]);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-app-bg p-4 animate-fade-in">
      <div className="text-center flex-1 flex flex-col justify-center items-center">
        <div className="w-28 h-28 bg-primary/10 flex items-center justify-center rounded-full mb-8 ring-8 ring-primary/5 animate-subtle-float">
            <ShineIcon className="w-14 h-14 text-primary" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-app-text-primary tracking-tight mb-2">
          Prince Auto Parts
        </h1>
        <p className="text-md sm:text-lg text-app-text-secondary">
          Electrical Auto Parts Seller
        </p>
      </div>
      
      <div className="w-full max-w-xs text-center mb-16">
          <div className="w-full bg-app-surface rounded-full h-2 shadow-inner border border-app-border">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-app-text-secondary text-sm mt-3 transition-opacity duration-300">
            {progress < 100 ? `Initializing... ${Math.round(progress)}%` : 'Ready!'}
          </p>
      </div>

      <footer className="absolute bottom-4 text-center text-app-text-tertiary text-xs">
        <p>Developed by Prince InfoTech, Dhule</p>
      </footer>
    </div>
  );
};

export default SplashScreen;