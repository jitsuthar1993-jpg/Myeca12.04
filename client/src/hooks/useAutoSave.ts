import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebounce } from './useDebounce';

interface AutoSaveOptions<T> {
  key: string;
  defaultValue: T;
  debounceMs?: number;
  onSave?: (data: T) => void;
  onLoad?: (data: T) => void;
  validate?: (data: T) => boolean;
  expireAfterMs?: number; // Auto-expire saved data
}

interface SavedData<T> {
  data: T;
  savedAt: number;
  version: number;
}

const STORAGE_VERSION = 1;

export function useAutoSave<T>({
  key,
  defaultValue,
  debounceMs = 500,
  onSave,
  onLoad,
  validate,
  expireAfterMs,
}: AutoSaveOptions<T>) {
  const [data, setData] = useState<T>(defaultValue);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const isInitialized = useRef(false);
  const storageKey = `autosave_${key}`;

  // Debounced data for saving
  const debouncedData = useDebounce(data, debounceMs);

  // Load saved data on mount
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed: SavedData<T> = JSON.parse(stored);
        
        // Check version compatibility
        if (parsed.version !== STORAGE_VERSION) {
          console.warn(`AutoSave: Version mismatch for ${key}, using default`);
          return;
        }

        // Check expiration
        if (expireAfterMs && Date.now() - parsed.savedAt > expireAfterMs) {
          console.log(`AutoSave: Data expired for ${key}`);
          localStorage.removeItem(storageKey);
          return;
        }

        // Validate data
        if (validate && !validate(parsed.data)) {
          console.warn(`AutoSave: Validation failed for ${key}`);
          return;
        }

        setData(parsed.data);
        setLastSaved(new Date(parsed.savedAt));
        onLoad?.(parsed.data);
      }
    } catch (error) {
      console.error('AutoSave: Error loading saved data:', error);
    }
  }, [key, storageKey, validate, onLoad, expireAfterMs]);

  // Save data when debounced value changes
  useEffect(() => {
    if (!isInitialized.current) return;
    
    // Don't save if it's the initial load or default value
    if (JSON.stringify(debouncedData) === JSON.stringify(defaultValue)) {
      return;
    }

    setIsSaving(true);
    
    try {
      const saveData: SavedData<T> = {
        data: debouncedData,
        savedAt: Date.now(),
        version: STORAGE_VERSION,
      };
      
      localStorage.setItem(storageKey, JSON.stringify(saveData));
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      onSave?.(debouncedData);
    } catch (error) {
      console.error('AutoSave: Error saving data:', error);
    } finally {
      setIsSaving(false);
    }
  }, [debouncedData, storageKey, onSave, defaultValue]);

  // Track unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [data]);

  // Update data with change tracking
  const updateData = useCallback((newData: T | ((prev: T) => T)) => {
    setData(prev => {
      const updated = typeof newData === 'function' 
        ? (newData as (prev: T) => T)(prev) 
        : newData;
      return updated;
    });
  }, []);

  // Update a specific field
  const updateField = useCallback(<K extends keyof T>(
    field: K,
    value: T[K]
  ) => {
    setData(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Clear saved data
  const clearSaved = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setData(defaultValue);
      setLastSaved(null);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('AutoSave: Error clearing data:', error);
    }
  }, [storageKey, defaultValue]);

  // Force save immediately
  const forceSave = useCallback(() => {
    try {
      const saveData: SavedData<T> = {
        data,
        savedAt: Date.now(),
        version: STORAGE_VERSION,
      };
      localStorage.setItem(storageKey, JSON.stringify(saveData));
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      onSave?.(data);
    } catch (error) {
      console.error('AutoSave: Error force saving:', error);
    }
  }, [data, storageKey, onSave]);

  // Reset to default values
  const reset = useCallback(() => {
    setData(defaultValue);
    setHasUnsavedChanges(true);
  }, [defaultValue]);

  return {
    data,
    setData: updateData,
    updateField,
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    clearSaved,
    forceSave,
    reset,
  };
}

// Hook for calculator-specific auto-save
interface CalculatorInput {
  [key: string]: number | string | boolean;
}

export function useCalculatorAutoSave(calculatorId: string, defaultInputs: CalculatorInput) {
  const {
    data,
    setData,
    updateField,
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    clearSaved,
    reset,
  } = useAutoSave<CalculatorInput>({
    key: `calculator_${calculatorId}`,
    defaultValue: defaultInputs,
    debounceMs: 300,
    expireAfterMs: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return {
    inputs: data,
    setInputs: setData,
    updateInput: updateField,
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    clearInputs: clearSaved,
    resetInputs: reset,
  };
}

// Hook for form auto-save with more features
export function useFormAutoSave<T extends Record<string, any>>(
  formId: string,
  defaultValues: T,
  options?: {
    onRestore?: (data: T) => void;
    shouldWarnOnLeave?: boolean;
  }
) {
  const {
    data,
    setData,
    updateField,
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    clearSaved,
    forceSave,
    reset,
  } = useAutoSave<T>({
    key: `form_${formId}`,
    defaultValue: defaultValues,
    debounceMs: 500,
    expireAfterMs: 24 * 60 * 60 * 1000, // 24 hours
    onLoad: options?.onRestore,
  });

  // Warn user before leaving with unsaved changes
  useEffect(() => {
    if (!options?.shouldWarnOnLeave) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, options?.shouldWarnOnLeave]);

  return {
    formData: data,
    setFormData: setData,
    updateFormField: updateField,
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    clearForm: clearSaved,
    saveForm: forceSave,
    resetForm: reset,
  };
}

// Utility to get all saved forms
export function getSavedForms(): { key: string; savedAt: Date }[] {
  const saved: { key: string; savedAt: Date }[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('autosave_')) {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        if (data.savedAt) {
          saved.push({
            key: key.replace('autosave_', ''),
            savedAt: new Date(data.savedAt),
          });
        }
      } catch {
        // Ignore invalid entries
      }
    }
  }
  
  return saved.sort((a, b) => b.savedAt.getTime() - a.savedAt.getTime());
}

// Clear all auto-saved data
export function clearAllAutoSaved(): void {
  const keysToRemove: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('autosave_')) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
}

