import React, { useMemo, useState } from 'react';
import type { DataType, GuideData, WiperEntry, BulbEntry, WiperData, BulbData } from '../types';
import CheckCircleIcon from './icons/CheckCircleIcon';
import XCircleIcon from './icons/XCircleIcon';
import CancelIcon from './icons/CancelIcon';
import UploadIcon from './icons/UploadIcon';

interface JsonUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmUpload: (dataType: DataType, data: GuideData) => Promise<void>;
  dataType: DataType;
  jsonData: any;
  fileName: string;
}

interface ValidationResult {
  isValid: boolean;
  errorMap: Map<string, { makeError?: string; modelErrors: Map<number, string> }>;
  validData: GuideData;
  flatList: { make: string, modelData: any, index: number }[];
}

const JsonUploadModal: React.FC<JsonUploadModalProps> = ({
  isOpen,
  onClose,
  onConfirmUpload,
  dataType,
  jsonData,
  fileName,
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const validationResult: ValidationResult = useMemo(() => {
    const errorMap = new Map<string, { makeError?: string; modelErrors: Map<number, string> }>();
    const validData: GuideData = {};
    let hasErrors = false;

    if (typeof jsonData !== 'object' || jsonData === null || Array.isArray(jsonData)) {
      hasErrors = true;
      return { isValid: false, errorMap, validData: {}, flatList: [] };
    }
    
    const flatList = Object.entries(jsonData).flatMap(([make, models]) => 
      Array.isArray(models) 
        ? models.map((modelData, index) => ({ make, modelData, index }))
        : [{ make, modelData: null, index: -1 }]
    );

    for (const make in jsonData) {
      if (!Object.prototype.hasOwnProperty.call(jsonData, make)) continue;

      const makeErrors: { makeError?: string; modelErrors: Map<number, string> } = { modelErrors: new Map() };
      const models = jsonData[make];
      
      if (!Array.isArray(models)) {
        makeErrors.makeError = `Invalid format: value for this make should be an array of models.`;
        errorMap.set(make, makeErrors);
        hasErrors = true;
        continue;
      }
      
      validData[make] = [];
      models.forEach((entry, index) => {
        let modelError = '';
        if (typeof entry !== 'object' || entry === null) {
          modelError = 'Entry must be an object.';
        } else if (typeof entry.model !== 'string' || !entry.model.trim()) {
          modelError = 'Entry must have a non-empty "model" string property.';
        } else {
            if (dataType === 'wipers') {
                const requiredKeys: (keyof WiperEntry)[] = ['D', 'P'];
                const missingKeys = requiredKeys.filter(key => typeof entry[key] !== 'string');
                if (missingKeys.length > 0) {
                    modelError = `Wiper entries must have string properties for: ${missingKeys.join(', ')}.`;
                }
            } else { // bulbs
                 if(typeof (entry as BulbEntry).H_L !== 'string') {
                    modelError = 'Bulb entries must have an "H_L" (High/Low) string property.';
                }
            }
        }
        
        if (modelError) {
          makeErrors.modelErrors.set(index, modelError);
          hasErrors = true;
        } else {
          validData[make].push(entry);
        }
      });

      if (makeErrors.makeError || makeErrors.modelErrors.size > 0) {
        errorMap.set(make, makeErrors);
      }
    }

    const isValid = !hasErrors && Object.keys(jsonData).length > 0;
    return { isValid, errorMap, validData, flatList };
  }, [jsonData, dataType]);

  const handleConfirm = async () => {
    if (!validationResult.isValid || isUploading) return;
    setIsUploading(true);
    try {
      await onConfirmUpload(dataType, validationResult.validData);
      onClose();
    } catch (e) {
      console.error("Upload failed in modal:", e)
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-md" aria-modal="true" role="dialog">
      <div className="bg-glass-bg backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-scale-in">
        <header className="flex items-center justify-between p-4 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-app-text-primary">Upload Preview</h2>
            <p className="text-sm text-app-text-secondary truncate" title={fileName}>File: {fileName}</p>
          </div>
          <button onClick={onClose} className="p-2 text-app-text-secondary hover:bg-app-surface/20 rounded-full">
            <CancelIcon className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4">
          {!validationResult.flatList || validationResult.flatList.length === 0 && <p className="text-center text-app-text-secondary py-8">The JSON file appears to be empty or invalid.</p>}
          <ul className="divide-y divide-app-border/50">
            {validationResult.flatList.map((item, flatIndex) => {
              const { make, modelData, index } = item;
              if (index === -1) { // Make-level error
                const makeValidation = validationResult.errorMap.get(make);
                return (
                   <li key={`${make}-${flatIndex}`} className="flex items-start gap-3 py-3 text-sm bg-danger/10 px-2 -mx-2 rounded">
                     <XCircleIcon className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                     <div className="flex-1">
                       <p className="font-semibold text-app-text-primary">{make}</p>
                       <p className="text-xs text-danger mt-1">{makeValidation?.makeError}</p>
                     </div>
                   </li>
                )
              }
              const makeValidation = validationResult.errorMap.get(make);
              const modelError = makeValidation?.modelErrors.get(index);
              const isModelValid = !modelError;
              return (
                <li key={`${make}-${modelData?.model || 'invalid'}-${index}`} className="flex items-center gap-3 py-3 text-sm">
                  {isModelValid ? <CheckCircleIcon className="w-5 h-5 text-success flex-shrink-0" /> : <XCircleIcon className="w-5 h-5 text-danger flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-app-text-primary truncate">{modelData?.model || <span className="text-danger italic">[Missing/Invalid Model Name]</span>}</p>
                    <pre className="text-xs text-app-text-secondary mt-1 bg-app-surface/20 p-2 rounded font-mono overflow-x-auto border border-white/10">{JSON.stringify(modelData, null, 2)}</pre>
                    {modelError && <p className="text-xs text-danger mt-1">{modelError}</p>}
                  </div>
                </li>
              );
            })}
          </ul>
        </main>
        
        <footer className="p-4 bg-app-surface/20 border-t border-white/10 flex justify-end items-center gap-3">
            { !validationResult.isValid && validationResult.flatList.length > 0 && (
                <div className="flex items-center gap-2 text-danger mr-auto">
                    <XCircleIcon className="w-5 h-5" />
                    <span className="text-sm font-semibold">Please fix errors in the file.</span>
                </div>
            )}
          <button 
            onClick={onClose}
            disabled={isUploading}
            className="px-5 py-2 bg-app-surface/30 border border-white/10 text-app-text-primary rounded-lg hover:bg-app-surface/50 font-semibold transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            disabled={!validationResult.isValid || isUploading}
            className="px-5 py-2 bg-primary text-primary-text rounded-lg hover:bg-primary-hover font-semibold disabled:bg-app-surface/10 disabled:text-app-text-tertiary disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors min-w-[180px]"
          >
            {isUploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
            ) : (
                <>
                  <UploadIcon className="w-5 h-5" />
                  Confirm and Upload
                </>
            )}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default JsonUploadModal;