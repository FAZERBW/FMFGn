import React, { useState, useMemo, useEffect } from 'react';
import type { GuideData, DataType, Entry, WiperEntry, BulbEntry, AddEntryFn, UpdateEntryFn, DeleteEntryFn, AddMakeFn, DeleteMakeFn, UpdateMakeNameFn } from '../types';
import BackIcon from './icons/BackIcon';
import AddIcon from './icons/AddIcon';
import EditIcon from './icons/EditIcon';
import DeleteIcon from './icons/DeleteIcon';
import SaveIcon from './icons/SaveIcon';
import CancelIcon from './icons/CancelIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import DetailsPopup from './DetailsPopup';
import SearchIcon from './icons/SearchIcon';

interface GuideScreenProps {
  title: string;
  dataType: DataType;
  data: GuideData;
  headers: string[];
  onBack: () => void;
  isAdmin: boolean;
  addEntry: AddEntryFn;
  updateEntry: UpdateEntryFn;
  deleteEntry: DeleteEntryFn;
  addMake: AddMakeFn;
  deleteMake: DeleteMakeFn;
  updateMakeName: UpdateMakeNameFn;
  favorites?: {
    isFavorite: (make: string, entry: WiperEntry) => boolean;
    addFavorite: (make: string, entry: WiperEntry) => void;
    removeFavorite: (id: string) => void;
    createFavoriteId: (make: string, entry: WiperEntry) => string;
  };
}

const GuideScreen: React.FC<GuideScreenProps> = ({
  title,
  dataType,
  data,
  headers,
  onBack,
  isAdmin,
  addEntry,
  updateEntry,
  deleteEntry,
  addMake,
  deleteMake,
  updateMakeName,
  favorites,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedMakes, setExpandedMakes] = useState<Record<string, boolean>>({});
  
  const [editingEntry, setEditingEntry] = useState<{make: string; index: number; data: Entry} | null>(null);
  const [addingEntry, setAddingEntry] = useState<{make: string; data: Entry} | null>(null);
  const [newMakeName, setNewMakeName] = useState('');
  const [editingMake, setEditingMake] = useState<{ oldName: string; newName: string } | null>(null);
  const [selectedItem, setSelectedItem] = useState<{ make: string; entry: Entry; allEntries: Entry[] } | null>(null);


  const priorityMakes = useMemo(() => [
    'MARUTI', 'MAHINDRA', 'TATA', 'FORD', 'HYUNDAI', 'TOYOTA', 'RENAULT', 'CHEVROLET', 'HONDA',
  ], []);

  const customSort = useMemo(() => (a: string, b: string) => {
    const aUpper = a.toUpperCase();
    const bUpper = b.toUpperCase();
    const aIndex = priorityMakes.findIndex(p => aUpper.startsWith(p));
    const bIndex = priorityMakes.findIndex(p => bUpper.startsWith(p));

    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.localeCompare(b);
  }, [priorityMakes]);


  const searchKeys = useMemo(() => dataType === 'wipers' ? ['model', 'D', 'P', 'R'] : ['model', 'H_L', 'LOW', 'HIGH', 'FOG_LIGHT'], [dataType]);

  const sortedMakes = useMemo(() => Object.keys(data).sort(customSort), [data, customSort]);

  const filteredData = useMemo(() => {
    if (!searchTerm) {
      return data as Record<string, Entry[]>;
    }
    
    const searchWords = searchTerm.toLowerCase().split(' ').filter(Boolean);
    if (!searchWords.length) {
        return data as Record<string, Entry[]>;
    }

    const finalResult: Record<string, Entry[]> = {};

    for (const make of sortedMakes) {
        const models = (data as Record<string, Entry[]>)[make];
        const filteredModels = models.filter(item => {
            const searchableText = [make, ...searchKeys.map(key => (item as any)[key])].filter(Boolean).join(' ').toLowerCase();
            return searchWords.every(word => searchableText.includes(word));
        });

        if (filteredModels.length > 0) finalResult[make] = filteredModels;
    }
    return finalResult;
  }, [data, searchTerm, searchKeys, sortedMakes]);
  
  const filteredMakes = useMemo(() => Object.keys(filteredData).sort(customSort), [filteredData, customSort]);

  useEffect(() => {
      if (searchTerm) {
          const newExpanded: Record<string, boolean> = {};
          for (const make of filteredMakes) newExpanded[make] = true;
          setExpandedMakes(newExpanded);
      } else {
          setExpandedMakes({});
      }
  }, [searchTerm, filteredMakes]);

  const handleToggleMake = (make: string) => setExpandedMakes(prev => ({ ...prev, [make]: !prev[make] }));

  const handleEditChange = (field: keyof WiperEntry | keyof BulbEntry, value: string) => {
    if (!editingEntry) return;
    setEditingEntry(prev => prev ? { ...prev, data: { ...prev.data, [field]: value } as Entry } : null);
  };

  const handleAddChange = (field: keyof WiperEntry | keyof BulbEntry, value: string) => {
    if (!addingEntry) return;
    setAddingEntry(prev => prev ? { ...prev, data: { ...prev.data, [field]: value } as Entry } : null);
  };

  const handleSaveEdit = () => {
    if (!editingEntry) return;
    updateEntry(dataType, editingEntry.make, editingEntry.index, editingEntry.data);
    setEditingEntry(null);
  };
  
  const handleSaveNew = () => {
    if (!addingEntry || !addingEntry.data.model) {
      alert("Model name cannot be empty.");
      return;
    }
    addEntry(dataType, addingEntry.make, addingEntry.data);
    setAddingEntry(null);
  }

  const handleStartAdding = (make: string) => {
    const newEntryTemplate = dataType === 'wipers'
      ? { model: '', D: '', P: '', R: '' }
      : { model: '', H_L: '', LOW: '', HIGH: '', FOG_LIGHT: '' };
    setAddingEntry({ make, data: newEntryTemplate });
    setExpandedMakes(prev => ({ ...prev, [make]: true }));
  };
  
  const handleAddNewMake = async () => {
      const trimmedMake = newMakeName.trim();
      if(trimmedMake) {
          try {
            await addMake(dataType, trimmedMake);
            setNewMakeName('');
            handleStartAdding(trimmedMake);
          } catch(e) { console.error(e); }
      }
  }
  
  const handleDeleteMake = (make: string) => {
    if (window.confirm(`Are you sure you want to delete the entire make "${make}"? This cannot be undone.`)) {
        deleteMake(dataType, make);
    }
  };

  const handleSaveMakeName = async () => {
      if (!editingMake || !editingMake.newName.trim()) return;
      try {
          await updateMakeName(dataType, editingMake.oldName, editingMake.newName);
          setEditingMake(null);
      } catch (e) { console.error(e); }
  };

  const handleToggleFavorite = (make: string, entry: WiperEntry) => {
    if (!favorites) return;
    const id = favorites.createFavoriteId(make, entry);
    if (favorites.isFavorite(make, entry)) favorites.removeFavorite(id);
    else favorites.addFavorite(make, entry);
  };

  const renderItemRow = (item: Entry, make: string, index: number, allEntries: Entry[]) => {
    const isEditing = editingEntry?.make === make && editingEntry?.index === index;
    const isWiper = (i: Entry): i is WiperEntry => dataType === 'wipers';
    const isBulb = (i: Entry): i is BulbEntry => dataType === 'bulbs';
    const currentData = isEditing ? editingEntry.data : item;
    const commonInputClass = "w-full bg-app-surface border border-app-border rounded-md px-2 py-1 text-center font-mono focus:ring-1 ring-primary focus:outline-none";
    
    return (
      <tr className={`border-t border-app-border/50 transition-colors duration-200 ${isEditing ? 'bg-primary-light' : 'hover:bg-app-surface-muted/50'}`}>
        <td className="px-4 py-3 font-medium text-app-text-primary truncate">
            {isEditing ? (
                 <input type="text" value={currentData.model} onChange={(e) => handleEditChange('model', e.target.value)} className={`${commonInputClass} text-left font-sans`} autoFocus/>
            ) : (
                <button onClick={() => setSelectedItem({ make, entry: item, allEntries })} className="text-left hover:text-primary focus:text-primary focus:outline-none w-full truncate">
                    {currentData.model}
                </button>
            )}
        </td>
        { isWiper(currentData) && (<>
            <td className="px-4 py-3 text-center font-mono text-app-text-secondary">{isEditing ? <input type="text" value={currentData.D} onChange={(e) => handleEditChange('D', e.target.value)} className={commonInputClass} /> : currentData.D}</td>
            <td className="px-4 py-3 text-center font-mono text-app-text-secondary">{isEditing ? <input type="text" value={currentData.P} onChange={(e) => handleEditChange('P', e.target.value)} className={commonInputClass} /> : currentData.P}</td>
            <td className="px-4 py-3 text-center font-mono text-app-text-secondary">{isEditing ? <input type="text" value={currentData.R || ''} onChange={(e) => handleEditChange('R', e.target.value)} className={commonInputClass} /> : (currentData.R || '-')}</td>
        </>)}
        { isBulb(currentData) && (<>
            <td className="px-4 py-3 text-center font-mono text-app-text-secondary">{isEditing ? <input type="text" value={currentData.H_L} onChange={(e) => handleEditChange('H_L', e.target.value)} className={commonInputClass} /> : currentData.H_L}</td>
            <td className="px-4 py-3 text-center font-mono text-app-text-secondary">{isEditing ? <input type="text" value={currentData.LOW || ''} onChange={(e) => handleEditChange('LOW', e.target.value)} className={commonInputClass} /> : (currentData.LOW || '-')}</td>
            <td className="px-4 py-3 text-center font-mono text-app-text-secondary">{isEditing ? <input type="text" value={currentData.HIGH || ''} onChange={(e) => handleEditChange('HIGH', e.target.value)} className={commonInputClass} /> : (currentData.HIGH || '-')}</td>
            <td className="px-4 py-3 text-center font-mono text-app-text-secondary">{isEditing ? <input type="text" value={currentData.FOG_LIGHT || ''} onChange={(e) => handleEditChange('FOG_LIGHT', e.target.value)} className={commonInputClass} /> : (currentData.FOG_LIGHT || '-')}</td>
        </>)}
        {isAdmin && (
            <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end space-x-1">
                    {isEditing ? (<>
                        <button onClick={handleSaveEdit} className="p-2 text-success hover:bg-success-light rounded-full"><SaveIcon className="w-5 h-5" /></button>
                        <button onClick={() => setEditingEntry(null)} className="p-2 text-danger hover:bg-danger-light rounded-full"><CancelIcon className="w-5 h-5" /></button>
                    </>) : (<>
                        <button onClick={() => setEditingEntry({make, index, data: item})} className="p-2 text-app-text-secondary hover:text-primary hover:bg-primary-light rounded-full"><EditIcon className="w-5 h-5" /></button>
                        <button onClick={() => { if(window.confirm(`Delete ${item.model}?`)) deleteEntry(dataType, make, index) }} className="p-2 text-app-text-secondary hover:text-danger hover:bg-danger-light rounded-full"><DeleteIcon className="w-5 h-5" /></button>
                    </>)}
                </div>
            </td>
        )}
      </tr>
    );
  };

  const renderAddItemRow = (make: string) => {
    if (!isAdmin || !addingEntry || addingEntry.make !== make) return null;

    const isWiper = (i: Entry): i is WiperEntry => dataType === 'wipers';
    const isBulb = (i: Entry): i is BulbEntry => dataType === 'bulbs';
    const commonInputClass = "w-full bg-app-surface border border-app-border rounded-md px-2 py-1 text-center font-mono focus:ring-1 ring-primary focus:outline-none";
    
    return (
        <tr className="border-t-2 border-primary bg-primary-light/50">
            <td className="px-4 py-3"><input type="text" placeholder="New Model" value={addingEntry.data.model} onChange={(e) => handleAddChange('model', e.target.value)} className={`${commonInputClass} text-left font-sans`} autoFocus /></td>
            { isWiper(addingEntry.data) && (<>
                <td className="px-4 py-3"><input type="text" placeholder="D" value={addingEntry.data.D} onChange={(e) => handleAddChange('D', e.target.value)} className={commonInputClass} /></td>
                <td className="px-4 py-3"><input type="text" placeholder="P" value={addingEntry.data.P} onChange={(e) => handleAddChange('P', e.target.value)} className={commonInputClass} /></td>
                <td className="px-4 py-3"><input type="text" placeholder="R" value={addingEntry.data.R || ''} onChange={(e) => handleAddChange('R', e.target.value)} className={commonInputClass} /></td>
            </>)}
             { isBulb(addingEntry.data) && (<>
                <td className="px-4 py-3"><input type="text" placeholder="H/L" value={addingEntry.data.H_L} onChange={(e) => handleAddChange('H_L', e.target.value)} className={commonInputClass} /></td>
                <td className="px-4 py-3"><input type="text" placeholder="Low" value={addingEntry.data.LOW || ''} onChange={(e) => handleAddChange('LOW', e.target.value)} className={commonInputClass} /></td>
                <td className="px-4 py-3"><input type="text" placeholder="High" value={addingEntry.data.HIGH || ''} onChange={(e) => handleAddChange('HIGH', e.target.value)} className={commonInputClass} /></td>
                <td className="px-4 py-3"><input type="text" placeholder="Fog" value={addingEntry.data.FOG_LIGHT || ''} onChange={(e) => handleAddChange('FOG_LIGHT', e.target.value)} className={commonInputClass} /></td>
            </>)}
            {isAdmin && (
                <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end space-x-1">
                        <button onClick={handleSaveNew} className="p-2 text-success hover:bg-success-light rounded-full"><SaveIcon className="w-5 h-5" /></button>
                        <button onClick={() => setAddingEntry(null)} className="p-2 text-danger hover:bg-danger-light rounded-full"><CancelIcon className="w-5 h-5" /></button>
                    </div>
                </td>
            )}
        </tr>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-transparent">
      <header className="sticky top-0 z-20 flex items-center justify-between p-4 bg-app-bg/50 backdrop-blur-xl border-b border-white/10">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-app-surface-muted transition-colors">
          <BackIcon className="w-6 h-6 text-app-text-primary" />
        </button>
        <h1 className="text-xl font-bold text-app-text-primary">{title}</h1>
        <div className="w-10"></div>
      </header>
      
      <div className="p-4 sticky top-[73px] z-10 bg-app-bg/80 backdrop-blur-sm border-b border-white/10">
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-app-text-tertiary">
              <SearchIcon className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search make, model, or size..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-app-surface/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 ring-primary placeholder:text-app-text-tertiary"
            />
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-3">
          {filteredMakes.length > 0 ? (
            filteredMakes.map((make, makeIndex) => (
              <div key={make} className={`bg-app-surface/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-app-border transition-all duration-300 animate-slide-in-up`} style={{ animationDelay: `${Math.min(makeIndex * 30, 300)}ms`}}>
                <button
                  onClick={() => handleToggleMake(make)}
                  className="w-full flex justify-between items-center p-4 text-left bg-app-surface-muted/60"
                >
                  <div className="flex items-center gap-4">
                    {editingMake?.oldName === make ? (
                      <input
                          type="text"
                          value={editingMake.newName}
                          onChange={(e) => setEditingMake({ ...editingMake, newName: e.target.value })}
                          onKeyDown={e => e.key === 'Enter' && handleSaveMakeName()}
                          onBlur={handleSaveMakeName}
                          className="text-xl font-bold bg-app-surface p-2 rounded-md ring-primary ring-2 focus:outline-none"
                          autoFocus
                          onClick={e => e.stopPropagation()}
                      />
                    ) : (
                      <h2 className="text-xl font-bold text-app-text-primary">{make}</h2>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isAdmin && !editingMake && (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); setEditingMake({ oldName: make, newName: make }); }} className="p-2 text-app-text-secondary hover:text-primary hover:bg-primary-light rounded-full"><EditIcon className="w-5 h-5" /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteMake(make); }} className="p-2 text-app-text-secondary hover:text-danger hover:bg-danger-light rounded-full"><DeleteIcon className="w-5 h-5" /></button>
                      </>
                    )}
                    <ChevronDownIcon className={`w-6 h-6 text-app-text-secondary transition-transform duration-300 ${expandedMakes[make] ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                
                {expandedMakes[make] && (
                  <div className="animate-fade-in">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-app-text-secondary uppercase bg-app-surface/30">
                        <tr>
                          {headers.map((header, i) => (
                            <th key={header} scope="col" className={`px-4 py-3 ${i > 0 ? 'text-center' : ''}`}>{header}</th>
                          ))}
                          {isAdmin && <th scope="col" className="px-4 py-3 text-right">Actions</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData[make].map((item, index) => renderItemRow(item, make, index, filteredData[make]))}
                        {renderAddItemRow(make)}
                      </tbody>
                    </table>
                    {isAdmin && !addingEntry && (
                      <div className="p-2">
                        <button
                          onClick={() => handleStartAdding(make)}
                          className="w-full flex items-center justify-center gap-2 p-2 text-sm font-semibold text-app-text-secondary hover:text-primary hover:bg-primary-light rounded-lg transition-colors"
                        >
                          <AddIcon className="w-5 h-5" /> Add New Model
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-16 text-app-text-secondary">
              <p className="font-semibold text-lg">No results found</p>
              <p>Try adjusting your search terms.</p>
            </div>
          )}

          {isAdmin && (
            <div className="pt-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMakeName}
                  onChange={(e) => setNewMakeName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddNewMake()}
                  placeholder="Add new make (e.g., Tesla)"
                  className="flex-grow w-full px-4 py-3 bg-app-surface/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 ring-primary placeholder:text-app-text-tertiary"
                />
                <button
                  onClick={handleAddNewMake}
                  className="px-5 py-3 bg-primary text-primary-text rounded-lg hover:bg-primary-hover font-semibold transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {selectedItem && favorites && (
          <DetailsPopup
              dataType={dataType}
              make={selectedItem.make}
              entry={selectedItem.entry}
              allEntries={selectedItem.allEntries}
              onClose={() => setSelectedItem(null)}
              favorites={favorites}
          />
      )}
    </div>
  );
};

export default GuideScreen;
