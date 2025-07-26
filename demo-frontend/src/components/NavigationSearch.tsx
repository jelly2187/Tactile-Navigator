import React, { useState } from 'react';
import { Search, ArrowRight, MapPin, Mic, Home, Briefcase, Utensils, ShoppingBag } from 'lucide-react';
import type { Destination } from '../types';
import MapComponent from './MapComponent';

interface NavigationSearchProps {
  onSearch: (query: string) => void;
  onDestinationSelect: (destination: Destination) => void;
  onVoiceSearch: () => void;
}

const NavigationSearch: React.FC<NavigationSearchProps> = ({
  onSearch,
  onDestinationSelect,
  onVoiceSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const commonDestinations: Destination[] = [
    { id: '1', name: '家', icon: 'home' },
    { id: '2', name: '公司', icon: 'briefcase' },
    { id: '3', name: '餐厅', icon: 'utensils' },
    { id: '4', name: '购物中心', icon: 'shopping-bag' },
  ];

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'home': return <Home size={20} className="text-primary-400" />;
      case 'briefcase': return <Briefcase size={20} className="text-primary-400" />;
      case 'utensils': return <Utensils size={20} className="text-primary-400" />;
      case 'shopping-bag': return <ShoppingBag size={20} className="text-primary-400" />;
      default: return <MapPin size={20} className="text-primary-400" />;
    }
  };

  return (
    <div className="flex flex-col justify-between w-[390px] min-h-[844px] bg-primary-50">
      {/* 搜索区域 */}
      <div className="pt-3 pr-6 pb-3 pl-6 bg-primary-50">
        <div className="flex items-center">
          <div className="flex grow shrink items-center mr-3 pt-[12px] pr-[12px] pb-[12px] pl-[12px] rounded-[6px] bg-primary-100">
            <div className="flex justify-center items-center w-5 h-5 mr-3">
              <Search size={20} className="text-primary-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="搜索目的地"
              className="bg-transparent grow shrink outline-none text-[14px] text-primary-600"
            />
          </div>
          <button
            onClick={handleSearch}
            className="flex justify-center items-center pt-[12px] pr-[12px] pb-[12px] pl-[12px] rounded-[6px] bg-primary-500 text-white"
          >
            <div className="flex justify-center items-center w-5 h-5">
              <ArrowRight size={20} />
            </div>
          </button>
        </div>
      </div>

      {/* 地图显示区域 */}
      <div className="relative w-full h-[400px]">
        <MapComponent className="w-full h-full" />
      </div>

      {/* 常用目的地 */}
      <div className="pt-4 pr-6 pb-2 pl-6">
        <h3 className="mb-3 text-[14px] font-medium text-primary-600">常用目的地</h3>
        <div className="flex flex-wrap gap-3">
          {commonDestinations.map((destination) => (
            <button
              key={destination.id}
              onClick={() => onDestinationSelect(destination)}
              className="flex items-center gap-3 pt-[12px] pr-[12px] pb-[12px] pl-[12px] rounded-[6px] bg-primary-100"
            >
              <div className="flex justify-center items-center w-5 h-5">
                {getIconComponent(destination.icon)}
              </div>
              <span className="text-[12px] text-primary-600">{destination.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 语音输入按钮 */}
      <div className="flex justify-center mt-4 mb-4">
        <button
          onClick={onVoiceSearch}
          className="flex justify-center items-center w-16 h-16 rounded-full bg-primary-600"
        >
          <div className="flex justify-center items-center w-8 h-8">
            <Mic size={32} className="text-white" />
          </div>
        </button>
      </div>
    </div>
  );
};

export default NavigationSearch; 