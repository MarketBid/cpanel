import React, { useState } from 'react';
import { motion } from 'motion/react';

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  content?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: (activeTab: Tab) => React.ReactNode;
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  onChange,
  variant = 'default',
  size = 'md',
  className = '',
  children,
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-5 py-2.5',
  };

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className={className}>
      {/* Tab buttons */}
      <div
        className={`flex ${
          variant === 'pills'
            ? 'gap-2 bg-[var(--bg-tertiary)] p-1 rounded-lg'
            : variant === 'underline'
            ? 'border-b border-[var(--border-default)]'
            : 'gap-1 border-b border-[var(--border-default)]'
        }`}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                relative flex items-center gap-2 font-medium transition-all duration-200
                ${sizeClasses[size]}
                ${
                  variant === 'pills'
                    ? isActive
                      ? 'bg-[var(--bg-card)] text-[var(--color-primary)] shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    : variant === 'underline'
                    ? isActive
                      ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    : isActive
                    ? 'bg-[var(--bg-card)] text-[var(--color-primary)] border border-[var(--border-default)] border-b-0 rounded-t-lg'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }
              `}
            >
              {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-[var(--color-primary)] text-white">
                  {tab.badge}
                </span>
              )}
              
              {variant === 'pills' && isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-[var(--bg-card)] rounded-lg shadow-sm -z-10"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="mt-4">
        {children ? (
          activeTabData && children(activeTabData)
        ) : (
          activeTabData?.content && (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTabData.content}
            </motion.div>
          )
        )}
      </div>
    </div>
  );
};

export default Tabs;

