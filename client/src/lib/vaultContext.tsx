import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './authContext';

export interface PasswordEntry {
  id: string;
  service: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

interface VaultContextType {
  passwords: PasswordEntry[];
  addPassword: (entry: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePassword: (id: string, entry: Partial<PasswordEntry>) => void;
  deletePassword: (id: string) => void;
  searchPasswords: (query: string) => PasswordEntry[];
  categories: string[];
}

const VaultContext = createContext<VaultContextType | null>(null);

const DEFAULT_CATEGORIES = ['Social', 'Work', 'Finance', 'Shopping', 'Entertainment', 'Other'];

const SAMPLE_PASSWORDS: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { service: 'Google', username: 'user@gmail.com', password: 'G00gl3P@ss!', url: 'https://google.com', category: 'Work', notes: 'Main Google account' },
  { service: 'GitHub', username: 'developer123', password: 'G1tHub$ecure', url: 'https://github.com', category: 'Work', notes: 'Development account' },
  { service: 'Netflix', username: 'moviefan@email.com', password: 'N3tfl1x&Ch1ll', url: 'https://netflix.com', category: 'Entertainment' },
  { service: 'Amazon', username: 'shopper@email.com', password: 'Am@z0nPr1me!', url: 'https://amazon.com', category: 'Shopping' },
  { service: 'Twitter', username: '@socialuser', password: 'Tw33t$ecure', url: 'https://twitter.com', category: 'Social' },
  { service: 'Bank of America', username: 'bankuser123', password: 'B@nk$3cur3!ty', url: 'https://bankofamerica.com', category: 'Finance', notes: 'Primary checking account' },
];

export function VaultProvider({ children }: { children: ReactNode }) {
  const { user, isVaultUnlocked } = useAuth();
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);

  useEffect(() => {
    if (user && isVaultUnlocked) {
      const storageKey = `vaultkey_passwords_${user.id}`;
      const stored = localStorage.getItem(storageKey);
      
      if (stored) {
        const parsed = JSON.parse(stored);
        setPasswords(parsed.map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt)
        })));
      } else {
        const initialPasswords: PasswordEntry[] = SAMPLE_PASSWORDS.map(p => ({
          ...p,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date()
        }));
        setPasswords(initialPasswords);
        localStorage.setItem(storageKey, JSON.stringify(initialPasswords));
      }
    } else {
      setPasswords([]);
    }
  }, [user, isVaultUnlocked]);

  const savePasswords = (newPasswords: PasswordEntry[]) => {
    if (user) {
      localStorage.setItem(`vaultkey_passwords_${user.id}`, JSON.stringify(newPasswords));
    }
  };

  const addPassword = (entry: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newEntry: PasswordEntry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const updated = [...passwords, newEntry];
    setPasswords(updated);
    savePasswords(updated);
  };

  const updatePassword = (id: string, entry: Partial<PasswordEntry>) => {
    const updated = passwords.map(p => 
      p.id === id ? { ...p, ...entry, updatedAt: new Date() } : p
    );
    setPasswords(updated);
    savePasswords(updated);
  };

  const deletePassword = (id: string) => {
    const updated = passwords.filter(p => p.id !== id);
    setPasswords(updated);
    savePasswords(updated);
  };

  const searchPasswords = (query: string): PasswordEntry[] => {
    if (!query.trim()) return passwords;
    const lower = query.toLowerCase();
    return passwords.filter(p => 
      p.service.toLowerCase().includes(lower) ||
      p.username.toLowerCase().includes(lower) ||
      p.category.toLowerCase().includes(lower) ||
      p.url?.toLowerCase().includes(lower)
    );
  };

  return (
    <VaultContext.Provider value={{
      passwords,
      addPassword,
      updatePassword,
      deletePassword,
      searchPasswords,
      categories: DEFAULT_CATEGORIES
    }}>
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error('useVault must be used within a VaultProvider');
  }
  return context;
}