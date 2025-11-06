export interface WiperEntry {
  model: string;
  D: string; // Driver side
  P: string; // Passenger side
  R?: string; // Rear
}

export interface BulbEntry {
  model:string;
  H_L: string; // High/Low beam
  LOW?: string;
  HIGH?: string;
  FOG_LIGHT?: string;
}

export type Entry = WiperEntry | BulbEntry;

export type WiperData = Record<string, WiperEntry[]>;
export type BulbData = Record<string, BulbEntry[]>;
export type GuideData = WiperData | BulbData;

export interface FavoriteItem {
  id: string; // A unique ID, e.g., `${make}|${model}|${D}|${P}|${R}`
  make: string;
  entry: WiperEntry;
}

export interface AppSettings {
  latestVersion: string;
  updateUrl: string;
  updateMessage: string;
  forceUpdate: boolean;
}

export type ColorTheme = 'solar' | 'lunar';
export type Screen = 'main' | 'wipers' | 'bulbs' | 'settings' | 'appearance_settings' | 'favorites';
export type DataType = 'wipers' | 'bulbs';
// FIX: Add missing UIStyle type export.
export type UIStyle = 'classic';

export type AddEntryFn = (dataType: DataType, make: string, entry: Entry) => Promise<void>;
export type UpdateEntryFn = (dataType: DataType, make: string, index: number, entry: Entry) => Promise<void>;
export type DeleteEntryFn = (dataType: DataType, make: string, index: number) => Promise<void>;
export type AddMakeFn = (dataType: DataType, make: string) => Promise<void>;
export type DeleteMakeFn = (dataType: DataType, make: string) => Promise<void>;
export type BulkUpdateFn = (dataType: DataType, data: GuideData) => Promise<void>;
export type UpdateMakeNameFn = (dataType: DataType, oldMake: string, newMake: string) => Promise<void>;
export type UpdateAppSettingsFn = (settings: AppSettings) => Promise<void>;