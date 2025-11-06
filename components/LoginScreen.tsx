import React, { useState, useEffect, useCallback } from 'react';
import OnScreenKeyboard from './OnScreenKeyboard';

interface LoginScreenProps {
  onLoginSuccess: (isAdmin: boolean) => void;
}

const USER_PIN = '2112';
const ADMIN_STEP_1_PIN = '2502';
const ADMIN_STEP_2_PIN = '8788';

type LoginStep = 'user' | 'admin_step_2';

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [pin, setPin] = useState('');
  const [feedback, setFeedback] = useState({ message: 'Enter Your MPIN', error: false });
  const [step, setStep] = useState<LoginStep>('user');

  const resetPin = useCallback((message: string, error: boolean) => {
    setFeedback({ message, error: true });
    setTimeout(() => {
      setPin('');
      setFeedback({ message: step === 'user' ? 'Enter Your MPIN' : 'Enter Admin PIN', error: false });
    }, 1000);
  }, [step]);
  
  useEffect(() => {
    if (pin.length !== 4) return;

    if (step === 'admin_step_2') {
      if (pin === ADMIN_STEP_2_PIN) {
        onLoginSuccess(true);
      } else {
        setStep('user');
        resetPin('Authentication Failed', true);
      }
    } else { // step === 'user'
      if (pin === USER_PIN) {
        onLoginSuccess(false);
      } else if (pin === ADMIN_STEP_1_PIN) {
        setStep('admin_step_2');
        setPin('');
        setFeedback({ message: 'Enter Admin PIN', error: false });
      } else {
        resetPin('Incorrect PIN', true);
      }
    }
  }, [pin, onLoginSuccess, resetPin, step]);

  const handleKeyPress = (key: string) => {
    setPin(prevPin => (prevPin.length < 4 ? prevPin + key : prevPin));
  };

  const handleDelete = () => {
    setPin(prevPin => prevPin.slice(0, -1));
  };
  
  const containerClasses = `flex justify-center mb-8 space-x-4 transition-transform duration-300 ${feedback.error ? 'animate-shake' : ''}`;

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 bg-transparent animate-scale-in">
      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-app-text-primary">Prince Auto Parts</h1>
          <p className="text-sm text-app-text-secondary">Dhule, Maharashtra</p>
        </div>
        
        <div 
          className="bg-glass-bg backdrop-blur-xl rounded-xl shadow-lg p-6 sm:p-8 border border-white/10"
          style={{ ['--tw-shadow' as any]: '0 25px 50px -12px rgb(0 0 0 / 0.25)' }}
        >
            <p className={`text-center text-lg mb-6 font-medium transition-colors duration-300 ${feedback.error ? 'text-danger' : 'text-app-text-secondary'}`}>
              {feedback.message}
            </p>
            <div className={containerClasses}>
                {Array(4).fill(0).map((_, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full transition-all duration-300 ${
                      pin.length > i ? 'bg-primary scale-110 shadow-[0_0_10px_0_var(--primary)]' : 'bg-app-surface/50'
                    }`}
                  ></div>
                ))}
            </div>
            <OnScreenKeyboard onKeyPress={handleKeyPress} onDelete={handleDelete} />
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;