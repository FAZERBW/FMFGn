import React from 'react';

interface OnScreenKeyboardProps {
  onKeyPress: (key: string) => void;
  onDelete: () => void;
}

const OnScreenKeyboard: React.FC<OnScreenKeyboardProps> = ({ onKeyPress, onDelete }) => {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

  const handleKeyClick = (key: string) => {
    if (key === '⌫') {
      onDelete();
    } else if (key !== '') {
      onKeyPress(key);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-4 w-full max-w-xs mx-auto mt-4">
      {keys.map((key, index) => (
        <button
          key={key || `empty-${index}`}
          onClick={() => handleKeyClick(key)}
          disabled={key === ''}
          aria-label={key === '⌫' ? 'Backspace' : `Number ${key}`}
          className={`
            h-16 w-16 mx-auto text-2xl font-semibold rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-app-surface ring-primary
            transition-all duration-200
            ${key === '' 
              ? 'bg-transparent shadow-none border-none' 
              : 'bg-app-surface/10 border border-white/10 text-app-text-primary active:bg-app-surface/30 active:scale-95'
            }
            ${key === '⌫' ? 'text-lg' : ''}
          `}
        >
          {key}
        </button>
      ))}
    </div>
  );
};

export default OnScreenKeyboard;