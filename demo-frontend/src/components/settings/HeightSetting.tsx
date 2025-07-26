import React, { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';

interface HeightSettingProps {
  currentHeight: number;
  onBack: () => void;
  onSave: (height: number) => void;
}

const HeightSetting: React.FC<HeightSettingProps> = ({
  currentHeight,
  onBack,
  onSave,
}) => {
  const [height, setHeight] = useState(currentHeight);

  const handleSave = () => {
    onSave(height);
  };

  return (
    <div className="flex flex-col justify-between w-[390px] min-h-[844px] bg-primary-50">
      {/* 头部导航 */}
      <div className="pt-3 pr-6 pb-3 pl-6 bg-primary-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={onBack} className="mr-3">
              <ArrowLeft size={20} className="text-primary-600" />
            </button>
            <h3 className="text-[14px] font-medium text-primary-600">身高设置</h3>
          </div>
          <button onClick={handleSave}>
            <Check size={20} className="text-primary-600" />
          </button>
        </div>
      </div>

      {/* 身高输入 */}
      <div className="flex-1 pr-6 pl-6">
        <h3 className="mb-4 text-[14px] font-medium text-primary-600">设置您的身高</h3>
        
        <div className="pt-4 pr-4 pb-4 pl-4 rounded-[8px] bg-white shadow-card">
          <div className="flex items-center justify-between">
            <label className="text-[14px] font-medium text-primary-600">身高 (cm)</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              min="100"
              max="250"
              className="text-right text-[14px] text-primary-600 bg-transparent outline-none border-b border-primary-200 focus:border-primary-500"
            />
          </div>
          <p className="mt-2 text-[12px] text-primary-400">
            身高信息用于计算适合您的无障碍路线
          </p>
        </div>

        <div className="mt-6 pt-4 pr-4 pb-4 pl-4 rounded-[8px] bg-primary-100">
          <h4 className="text-[12px] font-medium text-primary-600 mb-2">身高范围说明</h4>
          <ul className="text-[12px] text-primary-400 space-y-1">
            <li>• 100-150cm: 儿童身高范围</li>
            <li>• 150-170cm: 青少年身高范围</li>
            <li>• 170-190cm: 成年人身高范围</li>
            <li>• 190-250cm: 特殊身高范围</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HeightSetting; 