import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isVaultUnlocked: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  unlockVault: (masterPassword: string) => Promise<boolean>;
  lockVault: () => void;
  lastActivity: number;
  updateActivity: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const INACTIVITY_TIMEOUT = 5 * 60 * 1000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  const updateActivity = () => {
    setLastActivity(Date.now());
  };

  useEffect(() => {
    if (!isVaultUnlocked) return;

    const checkInactivity = () => {
      if (Date.now() - lastActivity > INACTIVITY_TIMEOUT) {
        setIsVaultUnlocked(false);
      }
    };

    const interval = setInterval(checkInactivity, 10000);
    return () => clearInterval(interval);
  }, [isVaultUnlocked, lastActivity]);

  useEffect(() => {
    if (!isVaultUnlocked) return;

    const handleActivity = () => updateActivity();
    
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [isVaultUnlocked]);

  const login = async (email: string, password: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const storedUsers = localStorage.getItem('vaultkey_users');
    const users = storedUsers ? JSON.parse(storedUsers) : [];
    const foundUser = users.find((u: any) => u.email === email && u.password === password);
    
    if (foundUser) {
      setUser({ id: foundUser.id, email: foundUser.email, name: foundUser.name });
      return true;
    }
    return false;
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const storedUsers = localStorage.getItem('vaultkey_users');
    const users = storedUsers ? JSON.parse(storedUsers) : [];
    
    if (users.find((u: any) => u.email === email)) {
      return false;
    }
    
    const newUser = {
      id: crypto.randomUUID(),
      email,
      password,
      name,
      masterPassword: password
    };
    
    users.push(newUser);
    localStorage.setItem('vaultkey_users', JSON.stringify(users));
    setUser({ id: newUser.id, email: newUser.email, name: newUser.name });
    return true;
  };

  const logout = () => {
    setUser(null);
    setIsVaultUnlocked(false);
  };

  const unlockVault = async (masterPassword: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const storedUsers = localStorage.getItem('vaultkey_users');
    const users = storedUsers ? JSON.parse(storedUsers) : [];
    const currentUser = users.find((u: any) => u.id === user?.id);
    
    if (currentUser && currentUser.masterPassword === masterPassword) {
      setIsVaultUnlocked(true);
      updateActivity();
      return true;
    }
    return false;
  };

  const lockVault = () => {
    setIsVaultUnlocked(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isVaultUnlocked,
      login,
      signup,
      logout,
      unlockVault,
      lockVault,
      lastActivity,
      updateActivity
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}