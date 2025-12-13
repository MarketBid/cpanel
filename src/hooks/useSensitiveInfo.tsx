import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SensitiveInfoContextType {
  isVisible: boolean;
  toggleVisibility: () => void;
  maskAmount: (amount: number | string | undefined | null) => string;
}

const SensitiveInfoContext = createContext<SensitiveInfoContextType | undefined>(undefined);

export const SensitiveInfoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    // Check localStorage first
    const savedVisibility = localStorage.getItem('sensitiveInfoVisible');
    if (savedVisibility !== null) {
      return savedVisibility === 'true';
    }
    // Default to true if not found
    return true;
  });

  // Persist to localStorage whenever visibility changes
  useEffect(() => {
    localStorage.setItem('sensitiveInfoVisible', String(isVisible));
  }, [isVisible]);

  const toggleVisibility = () => {
    setIsVisible(prev => !prev);
  };

  const maskAmount = (amount: number | string | undefined | null): string => {
    // Handle undefined or null values
    if (amount === undefined || amount === null) {
      return '••••••';
    }

    if (isVisible) {
      if (typeof amount === 'number') {
        return amount.toLocaleString('en-GH', { minimumFractionDigits: 2 });
      }
      return amount.toString();
    }
    return '••••••';
  };

  return (
    <SensitiveInfoContext.Provider value={{ isVisible, toggleVisibility, maskAmount }}>
      {children}
    </SensitiveInfoContext.Provider>
  );
};

export const useSensitiveInfo = () => {
  const context = useContext(SensitiveInfoContext);
  if (context === undefined) {
    throw new Error('useSensitiveInfo must be used within a SensitiveInfoProvider');
  }
  return context;
};
