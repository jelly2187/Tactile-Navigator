import React from 'react';
import { ArrowLeft, Check } from 'lucide-react';

interface HandednessSettingProps {
  currentHandedness: 'left' | 'right';
  onBack: () => void;
  onSave: (handedness: 'left' | 'right') => void;
}

const HandednessSetting: React.FC<HandednessSettingProps> = ({
  currentHandedness,
  onBack,
  onSave,
}) => {
  const options = [
    { value: 'left', label: '左手模式', description: '适合左手操作习惯' },
    { value: 'right', label: '右手模式', description: '适合右手操作习惯' },
  ];

  return (
    <div className="flex flex-col justify-between w-[390px] min-h-[844px] bg-primary-50">
      {/* 头部导航 */}
      <div className="pt-3 pr-6 pb-3 pl-6 bg-primary-50">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-3">
            <ArrowLeft size={20} className="text-primary-600" />
          </button>
          <h3 className="text-[14px] font-medium text-primary-600">操作习惯</h3>
        </div>
      </div>

      {/* 选项列表 */}
      <div className="flex-1 pr-6 pl-6">
        <h3 className="mb-4 text-[14px] font-medium text-primary-600">选择您的操作习惯</h3>
        
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onSave(option.value as 'left' | 'right')}
            className="w-full mb-3 pt-4 pr-4 pb-4 pl-4 rounded-[8px] bg-white shadow-card text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-[14px] font-medium text-primary-600">{option.label}</h4>
                <p className="text-[12px] text-primary-400">{option.description}</p>
              </div>
              {currentHandedness === option.value && (
                <Check size={20} className="text-primary-500" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default HandednessSetting; 