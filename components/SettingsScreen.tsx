import React, { useState, useEffect } from 'react';
import type { DataType, BulkUpdateFn, GuideData, WiperData, BulbData, AppSettings } from '../types';
import BackIcon from './icons/BackIcon';
import DownloadIcon from './icons/DownloadIcon';
import UploadIcon from './icons/UploadIcon';
import JsonUploadModal from './JsonUploadModal';
import { useData } from '../hooks/useData';

interface SettingsScreenProps {
  onBack: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const { appSettings, updateAppSettings, bulkUpdateData } = useData();
  const [uploadModalState, setUploadModalState] = useState<{ dataType: DataType; data: any; fileName: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [version, setVersion] = useState('');
  const [updateUrl, setUpdateUrl] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');
  const [forceUpdate, setForceUpdate] = useState(false);

  useEffect(() => {
    if (appSettings) {
      setVersion(appSettings.latestVersion || '');
      setUpdateUrl(appSettings.updateUrl || '');
      setUpdateMessage(appSettings.updateMessage || '');
      setForceUpdate(appSettings.forceUpdate || false);
    }
  }, [appSettings]);

  const handleSaveAppSettings = async () => {
    if (!version.trim() || !updateUrl.trim()) {
      alert('Version and Update URL are required.');
      return;
    }
    setIsSaving(true);
    const newSettings: AppSettings = {
      latestVersion: version.trim(),
      updateUrl: updateUrl.trim(),
      updateMessage: updateMessage.trim(),
      forceUpdate,
    };
    await updateAppSettings(newSettings);
    setIsSaving(false);
  };

  const handleDownloadSample = (dataType: DataType) => {
    let csvContent = '';
    if (dataType === 'wipers') {
      csvContent = [
        'make,model,D,P,R',
        'Honda,"City, IVTEC",24",14",',
        'Maruti Suzuki,Swift,21",18",',
        'Hyundai,i20,24",16",12"'
      ].join('\n');
    } else { // bulbs
      csvContent = [
        'make,model,H_L,LOW,HIGH,FOG_LIGHT',
        'Maruti Suzuki,Swift Dzire,H4,,,',
        'Hyundai,Creta,H4,,,H27',
        'Volkswagen,"Polo, 2015",H7,H1,,H8'
      ].join('\n');
    }

    const content = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;
    const link = document.createElement('a');
    link.setAttribute('href', content);
    link.setAttribute('download', `${dataType}_sample.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJsonSample = (dataType: DataType) => {
    let sampleJsonData: WiperData | BulbData;
    if (dataType === 'wipers') {
        sampleJsonData = {
            "SampleMake1": [
                { "model": "Model A", "D": "24\"", "P": "16\"", "R": "12\"" },
                { "model": "Model B", "D": "22\"", "P": "18\"" }
            ],
            "SampleMake2": [
                { "model": "Model C", "D": "26\"", "P": "15\"" }
            ]
        };
    } else { // bulbs
        sampleJsonData = {
            "SampleMake1": [
                { "model": "Model X", "H_L": "H4", "FOG_LIGHT": "H11" },
                { "model": "Model Y", "H_L": "9005", "LOW": "9006", "HIGH": "9005" }
            ],
            "SampleMake2": [
                { "model": "Model Z", "H_L": "H7", "LOW": "H1" }
            ]
        };
    }

    const jsonString = JSON.stringify(sampleJsonData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `${dataType}_sample.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, dataType: DataType) => {
    const file = event.target.files?.[0];
    if (!file) {
      alert('No file selected.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      try {
        const parsedData = parseCSV(text, dataType);
        const confirmation = window.confirm(
          `Are you sure you want to upload this file for ${dataType}?\n\nWARNING: This will completely overwrite all existing ${dataType} data in the database. This action cannot be undone.`
        );
        if (confirmation) {
          bulkUpdateData(dataType, parsedData);
        }
      } catch (error: any) {
        alert(`Error parsing CSV: ${error.message}`);
      } finally {
        event.target.value = '';
      }
    };
    reader.onerror = () => {
        alert('Failed to read the file.');
        event.target.value = '';
    }
    reader.readAsText(file);
  };

  const handleJsonFileUpload = (event: React.ChangeEvent<HTMLInputElement>, dataType: DataType) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      try {
        const jsonData = JSON.parse(text);
        setUploadModalState({
          dataType,
          data: jsonData,
          fileName: file.name
        });
      } catch (error: any) {
        alert(`Error reading file: The file is not valid JSON. Details: ${error.message}`);
      } finally {
        event.target.value = '';
      }
    };
    reader.onerror = () => {
        alert('Failed to read the file.');
        event.target.value = '';
    }
    reader.readAsText(file);
  };
  
  const handleConfirmUpload = async (dataType: DataType, data: GuideData) => {
    try {
        await bulkUpdateData(dataType, data);
    } catch (e) {
        console.error("Upload failed from modal", e);
    } finally {
        setUploadModalState(null);
    }
  };

  const parseCSV = (csvText: string, dataType: DataType): GuideData => {
    // ... (parsing logic remains the same)
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
      }
      result.push(current.trim());
      return result;
    };
    
    const lines = csvText.trim().split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) throw new Error('CSV file must have a header row and at least one data row.');

    const headerLine = lines[0];
    const headers = parseCSVLine(headerLine).map(h => h.trim().toLowerCase());
    
    const requiredHeaders = ['make', 'model'];
    const validWiperHeaders = ['make', 'model', 'd', 'p', 'r'];
    const validBulbHeaders = ['make', 'model', 'h_l', 'low', 'high', 'fog_light'];
    
    const validHeaders = dataType === 'wipers' ? validWiperHeaders : validBulbHeaders;
    
    for (const required of requiredHeaders) {
        if (!headers.includes(required)) {
            throw new Error(`Invalid CSV headers. Missing required header: "${required}".`);
        }
    }

    for (const header of headers) {
        if (!validHeaders.includes(header)) {
            throw new Error(`Invalid CSV headers. Unknown or misspelled header: "${header}".`);
        }
    }
    
    const data: GuideData = {};
    const makeIndex = headers.indexOf('make');
    const modelIndex = headers.indexOf('model');

    for (let i = 1; i < lines.length; i++) {
        const rowNumber = i + 1;
        const line = lines[i];
        const values = parseCSVLine(line);

        if (values.length !== headers.length) {
            throw new Error(`Row ${rowNumber}: Incorrect number of columns. Expected ${headers.length}, but found ${values.length}.\nRow content: "${line}"`);
        }

        const make = values[makeIndex]?.trim();
        const model = values[modelIndex]?.trim();

        if (!make) {
            throw new Error(`Row ${rowNumber}: "make" column cannot be empty.\nRow content: "${line}"`);
        }
        if (!model) {
            throw new Error(`Row ${rowNumber}: "model" column cannot be empty.\nRow content: "${line}"`);
        }
        
        const entry: any = {};
        headers.forEach((header, index) => {
            const value = values[index]?.trim();
            if (value) {
                switch(header) {
                    case 'model': entry.model = value; break;
                    case 'd': entry.D = value; break;
                    case 'p': entry.P = value; break;
                    case 'r': entry.R = value; break;
                    case 'h_l': entry.H_L = value; break;
                    case 'low': entry.LOW = value; break;
                    case 'high': entry.HIGH = value; break;
                    case 'fog_light': entry.FOG_LIGHT = value; break;
                    default: break;
                }
            }
        });

        if (!data[make]) {
            data[make] = [];
        }
        (data as any)[make].push(entry);
    }
    return data;
  };

  const renderDataSection = (dataType: DataType) => {
    const title = dataType === 'wipers' ? 'Wiper Blade Data' : 'HL Bulb Data';
    
    return (
      <div className="bg-glass-bg backdrop-blur-xl p-6 rounded-xl shadow-lg border border-white/10">
        <h2 className="text-2xl font-bold text-app-text-primary mb-5">{title}</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={() => handleDownloadSample(dataType)} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-app-surface/20 text-app-text-primary rounded-lg hover:bg-app-surface/40 transition-colors font-semibold border border-white/10">
              <DownloadIcon className="w-5 h-5" />
              Download Sample CSV
            </button>
            <button onClick={() => handleDownloadJsonSample(dataType)} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-app-surface/20 text-app-text-primary rounded-lg hover:bg-app-surface/40 transition-colors font-semibold border border-white/10">
              <DownloadIcon className="w-5 h-5" />
              Download Sample JSON
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor={`${dataType}-csv-upload`} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-text rounded-lg hover:bg-primary-hover transition-colors font-semibold cursor-pointer">
                    <UploadIcon className="w-5 h-5" />
                    Upload New CSV
                </label>
                <input id={`${dataType}-csv-upload`} type="file" accept=".csv" className="hidden" onChange={(e) => handleFileUpload(e, dataType)} />
              </div>
              <div>
                <label htmlFor={`${dataType}-json-upload`} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-text rounded-lg hover:bg-primary-hover transition-colors font-semibold cursor-pointer">
                    <UploadIcon className="w-5 h-5" />
                    Upload New JSON
                </label>
                <input id={`${dataType}-json-upload`} type="file" accept=".json,application/json" className="hidden" onChange={(e) => handleJsonFileUpload(e, dataType)} />
              </div>
          </div>
          <p className="text-xs text-app-text-secondary text-center pt-1">Warning: Uploading a new file will replace all existing {dataType} data.</p>
        </div>
      </div>
    );
  };
  
  const renderAppUpdateSection = () => (
    <div className="bg-glass-bg backdrop-blur-xl p-6 rounded-xl shadow-lg border border-white/10">
      <h2 className="text-2xl font-bold text-app-text-primary mb-5">App Update Settings</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="app-version" className="block text-sm font-medium text-app-text-secondary mb-1">Latest Version</label>
          <input id="app-version" type="text" placeholder="e.g., 1.1.0" value={version} onChange={(e) => setVersion(e.target.value)} className="w-full px-3 py-2 bg-app-surface/20 border border-white/10 rounded-lg focus:outline-none focus:ring-2 ring-primary" />
        </div>
        <div>
          <label htmlFor="update-url" className="block text-sm font-medium text-app-text-secondary mb-1">Update URL</label>
          <input id="update-url" type="url" placeholder="https://example.com/update" value={updateUrl} onChange={(e) => setUpdateUrl(e.target.value)} className="w-full px-3 py-2 bg-app-surface/20 border border-white/10 rounded-lg focus:outline-none focus:ring-2 ring-primary" />
        </div>
        <div>
          <label htmlFor="update-message" className="block text-sm font-medium text-app-text-secondary mb-1">Update Message (What's New)</label>
          <textarea id="update-message" rows={3} placeholder="- Feature 1&#x0a;- Bug fix 2" value={updateMessage} onChange={(e) => setUpdateMessage(e.target.value)} className="w-full px-3 py-2 bg-app-surface/20 border border-white/10 rounded-lg focus:outline-none focus:ring-2 ring-primary" />
        </div>
        <div className="flex items-center">
          <input id="force-update" type="checkbox" checked={forceUpdate} onChange={(e) => setForceUpdate(e.target.checked)} className="h-4 w-4 rounded border-app-border text-primary focus:ring-primary bg-app-surface/20" />
          <label htmlFor="force-update" className="ml-2 block text-sm text-app-text-primary">Force Update (user cannot dismiss)</label>
        </div>
        <button onClick={handleSaveAppSettings} disabled={isSaving} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-text rounded-lg hover:bg-primary-hover transition-colors font-semibold disabled:opacity-50">
          {isSaving ? 'Saving...' : 'Save Update Settings'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-transparent">
      <header className="sticky top-0 z-20 flex items-center justify-between p-4 bg-app-bg/50 backdrop-blur-xl border-b border-white/10">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-app-surface-muted transition-colors">
          <BackIcon className="w-6 h-6 text-app-text-primary" />
        </button>
        <h1 className="text-xl font-bold text-app-text-primary">Admin Settings</h1>
        <div className="w-10"></div>
      </header>
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {renderAppUpdateSection()}
          {renderDataSection('wipers')}
          {renderDataSection('bulbs')}
        </div>
      </main>
       {uploadModalState && (
        <JsonUploadModal
            isOpen={!!uploadModalState}
            onClose={() => setUploadModalState(null)}
            onConfirmUpload={handleConfirmUpload}
            dataType={uploadModalState.dataType}
            jsonData={uploadModalState.data}
            fileName={uploadModalState.fileName}
        />
      )}
    </div>
  );
};

export default SettingsScreen;