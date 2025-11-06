import { useState, useEffect, useRef } from 'react';
import { database } from '../services/firebase';
import { ref, onValue, set, remove, get, update } from 'firebase/database';
import type { WiperData, BulbData, DataType, Entry, GuideData, AppSettings } from '../types';

// Helper to process data from Firebase, ensuring model entries are always arrays.
// This handles cases where Firebase returns an object for a sparse array.
// FIX: Made this function generic to return a specific data type (WiperData or BulbData) instead of a general one.
const processSnapshotData = <T extends GuideData>(snapshot: any): T => {
    const rawData = snapshot.val() || {};
    Object.keys(rawData).forEach(make => {
        const entries = rawData[make];
        if (entries && typeof entries === 'object' && !Array.isArray(entries)) {
            // Convert Firebase's object-as-array into a proper, dense array, filtering out nulls.
            rawData[make] = Object.values(entries).filter(Boolean); 
        } else if (!entries || !Array.isArray(entries)) {
            // Ensure it's an array, even if empty or null.
            rawData[make] = [];
        }
    });
    return rawData as T;
}


export const useData = () => {
  const [wipers, setWipers] = useState<WiperData>({});
  const [bulbs, setBulbs] = useState<BulbData>({});
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // useRef to track loading status without causing extra renders.
  const dataLoaded = useRef({ wipers: false, bulbs: false, appSettings: false });

  useEffect(() => {
    setLoading(true);
    const wipersRef = ref(database, 'wipers');
    const bulbsRef = ref(database, 'bulbs');
    const appSettingsRef = ref(database, 'admin/settings/app');

    const checkAllDataLoaded = () => {
        if (dataLoaded.current.wipers && dataLoaded.current.bulbs && dataLoaded.current.appSettings) {
            setLoading(false);
        }
    };

    const unsubscribeWipers = onValue(wipersRef, (snapshot) => {
        // FIX: Specify the generic type for processSnapshotData to ensure type compatibility with setWipers.
        setWipers(processSnapshotData<WiperData>(snapshot));
        if (!dataLoaded.current.wipers) {
            dataLoaded.current.wipers = true;
            checkAllDataLoaded();
        }
    }, (err: Error) => {
        setError(`Failed to load wiper data: ${err.message}`);
        if (!dataLoaded.current.wipers) {
            dataLoaded.current.wipers = true;
            checkAllDataLoaded();
        }
    });

    const unsubscribeBulbs = onValue(bulbsRef, (snapshot) => {
        // FIX: Specify the generic type for processSnapshotData to ensure type compatibility with setBulbs.
        setBulbs(processSnapshotData<BulbData>(snapshot));
        if (!dataLoaded.current.bulbs) {
            dataLoaded.current.bulbs = true;
            checkAllDataLoaded();
        }
    }, (err: Error) => {
        setError(prev => prev ? `${prev}\nFailed to load bulb data: ${err.message}` : `Failed to load bulb data: ${err.message}`);
        if (!dataLoaded.current.bulbs) {
            dataLoaded.current.bulbs = true;
            checkAllDataLoaded();
        }
    });
    
    const unsubscribeAppSettings = onValue(appSettingsRef, (snapshot) => {
        setAppSettings(snapshot.val() || null);
        if (!dataLoaded.current.appSettings) {
            dataLoaded.current.appSettings = true;
            checkAllDataLoaded();
        }
    }, (err: Error) => {
        setError(prev => prev ? `${prev}\nFailed to load app settings: ${err.message}` : `Failed to load app settings: ${err.message}`);
        if (!dataLoaded.current.appSettings) {
            dataLoaded.current.appSettings = true;
            checkAllDataLoaded();
        }
    });

    // Cleanup listeners on unmount
    return () => {
      unsubscribeWipers();
      unsubscribeBulbs();
      unsubscribeAppSettings();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addEntry = async (dataType: DataType, make: string, entry: Entry) => {
    const data = dataType === 'wipers' ? wipers : bulbs;
    const currentEntries = data[make] || [];
    const newEntries = [...currentEntries, entry];
    await set(ref(database, `${dataType}/${make}`), newEntries);
  };

  const updateEntry = async (dataType: DataType, make: string, index: number, entry: Entry) => {
    const data = dataType === 'wipers' ? wipers : bulbs;
    const currentEntries = data[make] || [];
    const newEntries = [...currentEntries];
    newEntries[index] = entry;
    await set(ref(database, `${dataType}/${make}`), newEntries);
  };

  const deleteEntry = async (dataType: DataType, make: string, index: number) => {
    const data = dataType === 'wipers' ? wipers : bulbs;
    const currentEntries = data[make] || [];
    const newEntries = currentEntries.filter((_, i) => i !== index);
    await set(ref(database, `${dataType}/${make}`), newEntries);
  };
  
  const addMake = async (dataType: DataType, make: string) => {
    if (!make) return;
    const trimmedMake = make.trim();
    if (!trimmedMake) return;

    const data = dataType === 'wipers' ? wipers : bulbs;
    // Case-insensitive check for existing make
    const existingMake = Object.keys(data).find(k => k.toLowerCase() === trimmedMake.toLowerCase());
    if (existingMake) {
      alert(`Make "${existingMake}" already exists.`);
      throw new Error(`Make "${existingMake}" already exists.`);
    }
    await set(ref(database, `${dataType}/${trimmedMake}`), []);
  };

  const deleteMake = async (dataType: DataType, make: string) => {
    await remove(ref(database, `${dataType}/${make}`));
  };
  
  const updateMakeName = async (dataType: DataType, oldMake: string, newMake: string) => {
    const trimmedNewMake = newMake.trim();
    if (!trimmedNewMake || trimmedNewMake === oldMake) return;

    const data = dataType === 'wipers' ? wipers : bulbs;
    const existingMake = Object.keys(data).find(k => k.toLowerCase() === trimmedNewMake.toLowerCase());

    if (existingMake) {
        alert(`Make "${existingMake}" already exists. Please choose a different name.`);
        throw new Error(`Make "${existingMake}" already exists.`);
    }

    const oldDbRef = ref(database, `${dataType}/${oldMake}`);
    const snapshot = await get(oldDbRef);
    const makeData = snapshot.val();

    const updates: Record<string, any> = {};
    updates[`${dataType}/${trimmedNewMake}`] = makeData;
    updates[`${dataType}/${oldMake}`] = null;

    await update(ref(database), updates);
  };
  
  const bulkUpdateData = async (dataType: DataType, data: GuideData) => {
      try {
          await set(ref(database, dataType), data);
          alert('Data uploaded successfully!');
      } catch (error: any) {
          const errorMessage = `Bulk update failed: ${error.message}`;
          setError(errorMessage);
          alert(errorMessage);
          throw error;
      }
  };

  const updateAppSettings = async (settings: AppSettings) => {
      try {
          await set(ref(database, 'admin/settings/app'), settings);
          alert('App update settings saved successfully!');
      } catch (error: any) {
          const errorMessage = `Failed to save app settings: ${error.message}`;
          setError(errorMessage);
          alert(errorMessage);
          throw error;
      }
  };

  return { wipers, bulbs, appSettings, loading, error, addEntry, updateEntry, deleteEntry, addMake, deleteMake, updateMakeName, bulkUpdateData, updateAppSettings };
};
