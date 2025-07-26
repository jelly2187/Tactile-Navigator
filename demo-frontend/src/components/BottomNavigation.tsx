import React from 'react';
import { MapPin, Car, User, Users, AlertTriangle } from 'lucide-react';
import type { TabType } from '../types';

interface BottomNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'navigation' as TabType, label: '导航', icon: MapPin },
    { id: 'departure' as TabType, label: '出发', icon: Car },
    { id: 'profile' as TabType, label: '我的', icon: User },
    { id: 'family' as TabType, label: '家人', icon: Users },
    { id: 'obstacle' as TabType, label: '障碍物', icon: AlertTriangle },
  ];

  return (
    <div className="flex flex-col mt-6">
      <nav className="flex justify-around items-center pt-[18px] pr-[18px] pb-[18px] pl-[18px] bg-primary-50">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col grow shrink items-center"
            >
              <div className="flex justify-center items-center w-6 h-6">
                <Icon 
                  size={24} 
                  className={isActive ? 'text-primary-600' : 'text-primary-300'} 
                />
              </div>
              <span className={`mt-1 text-[10px] ${isActive ? 'text-primary-600' : 'text-primary-300'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
      <div className="flex justify-center items-center h-[34px] bg-primary-50">
        <div className="w-[134px] h-[5px] rounded-[3px] bg-primary-300"></div>
      </div>
    </div>
  );
};

export default BottomNavigation; 