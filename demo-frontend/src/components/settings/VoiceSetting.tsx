import React from 'react';
import { ArrowLeft, Check, Volume2, VolumeX } from 'lucide-react';

interface VoiceSettingProps {
  voiceEnabled: boolean;
  onBack: () => void;
  onSave: (enabled: boolean) => void;
}

const VoiceSetting: React.FC<VoiceSettingProps> = ({
  voiceEnabled,
  onBack,
  onSave,
}) => {
  const options = [
    { 
      value: true, 
      label: '开启语音导航', 
      description: '在导航过程中提供语音指引',
      icon: Volume2
    },
    { 
      value: false, 
      label: '关闭语音导航', 
      description: '仅显示文字和视觉指引',
      icon: VolumeX
    },
  ];

  return (
    <div className="flex flex-col justify-between w-[390px] min-h-[844px] bg-primary-50">
      {/* 头部导航 */}
      <div className="pt-3 pr-6 pb-3 pl-6 bg-primary-50">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-3">
            <ArrowLeft size={20} className="text-primary-600" />
          </button>
          <h3 className="text-[14px] font-medium text-primary-600">语音导航</h3>
        </div>
      </div>

      {/* 选项列表 */}
      <div className="flex-1 pr-6 pl-6">
        <h3 className="mb-4 text-[14px] font-medium text-primary-600">选择语音导航模式</h3>
        
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.value.toString()}
              onClick={() => onSave(option.value)}
              className="w-full mb-3 pt-4 pr-4 pb-4 pl-4 rounded-[8px] bg-white shadow-card text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon size={20} className="text-primary-500" />
                  <div>
                    <h4 className="text-[14px] font-medium text-primary-600">{option.label}</h4>
                    <p className="text-[12px] text-primary-400">{option.description}</p>
                  </div>
                </div>
                {voiceEnabled === option.value && (
                  <Check size={20} className="text-primary-500" />
                )}
              </div>
            </button>
          );
        })}

        <div className="mt-6 pt-4 pr-4 pb-4 pl-4 rounded-[8px] bg-primary-100">
          <h4 className="text-[12px] font-medium text-primary-600 mb-2">语音导航说明</h4>
          <ul className="text-[12px] text-primary-400 space-y-1">
            <li>• 语音导航会在转弯、到达目的地时提醒您</li>
            <li>• 支持中文语音播报</li>
            <li>• 可调节语音音量和语速</li>
            <li>• 在安静环境下建议关闭语音</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VoiceSetting; 