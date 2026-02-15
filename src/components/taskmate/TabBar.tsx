import { CheckSquare, ShoppingCart } from 'lucide-react';

interface TabBarProps {
  activeTab: 'tasks' | 'shopping';
  onTabChange: (tab: 'tasks' | 'shopping') => void;
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="flex border-b border-border">
      <button
        onClick={() => onTabChange('tasks')}
        className={`tab-button ${activeTab === 'tasks' ? 'tab-active' : 'tab-inactive'}`}
      >
        <CheckSquare size={20} />
        Compiti
      </button>
      <button
        onClick={() => onTabChange('shopping')}
        className={`tab-button ${activeTab === 'shopping' ? 'tab-active' : 'tab-inactive'}`}
      >
        <ShoppingCart size={20} />
        Spesa
      </button>
    </div>
  );
}
