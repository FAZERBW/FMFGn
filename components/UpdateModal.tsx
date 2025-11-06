import React from 'react';
import type { AppSettings } from '../types';
import RocketIcon from './icons/RocketIcon';
import CancelIcon from './icons/CancelIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';

interface UpdateModalProps {
  settings: AppSettings;
  onClose: () => void;
  currentVersion: string;
}

const UpdateModal: React.FC<UpdateModalProps> = ({ settings, onClose, currentVersion }) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in" role="dialog" aria-modal="true">
      <div className="relative bg-glass-bg backdrop-blur-2xl w-full max-w-sm rounded-2xl shadow-2xl animate-scale-in border border-white/10">
        {!settings.forceUpdate && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 text-app-text-tertiary hover:bg-app-surface/20 rounded-full transition-colors"
            aria-label="Close update notification"
          >
            <CancelIcon className="w-5 h-5" />
          </button>
        )}
        
        <div className="p-8 text-center">
            <div className="w-20 h-20 bg-primary-light rounded-full mx-auto flex items-center justify-center ring-8 ring-primary/5 mb-6">
                <RocketIcon className="w-10 h-10 text-primary"/>
            </div>

            <h2 className="text-2xl font-bold text-app-text-primary">Update Available</h2>
            <p className="text-sm text-app-text-secondary mt-1">
                Version {currentVersion} → <span className="font-semibold text-primary">{settings.latestVersion}</span>
            </p>

            {settings.updateMessage && (
                <div className="text-left bg-app-surface/20 border border-white/10 p-4 rounded-lg my-6 text-sm">
                    <p className="font-semibold text-app-text-primary mb-3">What's new:</p>
                    <div className="space-y-2 text-app-text-secondary">
                        {settings.updateMessage.split('\n').map((line, index) => (
                            line.trim() && (
                                <p key={index} className="flex items-start gap-2.5">
                                    <CheckCircleIcon className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                                    <span>{line}</span>
                                </p>
                            )
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-8 space-y-3">
                <a
                  href={settings.updateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-block px-4 py-3 bg-primary text-primary-text rounded-lg hover:bg-primary-hover transition-colors font-semibold shadow-lg shadow-primary/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-app-surface ring-primary"
                >
                  Update Now
                </a>

                {!settings.forceUpdate && (
                  <button
                    onClick={onClose}
                    className="w-full px-4 py-2 text-sm font-medium text-app-text-secondary hover:bg-app-surface/20 rounded-lg transition-colors"
                  >
                    Later
                  </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateModal;