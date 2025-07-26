import React from 'react';
import { ChevronRight, Hand, Ruler, Volume2, Home, Briefcase, Plus, AlertTriangle, Medal, Edit } from 'lucide-react';
import type { UserPreferences, Destination } from '../types';

interface ProfileSettingsProps {
  preferences: UserPreferences;
  destinations: Destination[];
  onDestinationEdit: (destination: Destination) => void;
  onAddDestination: () => void;
  onReportObstacle: () => void;
  onViewContributions: () => void;
  onNavigateToSetting: (setting: string) => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  preferences,
  destinations,
  onDestinationEdit,
  onAddDestination,
  onReportObstacle,
  onViewContributions,
  onNavigateToSetting,
}) => {
  return (
    <div className="flex flex-col justify-between w-[390px] min-h-[844px] bg-primary-50">
      <div className="pt-4 pr-6 pb-4 pl-6">
        <h1 className="text-[20px] font-medium text-primary-600">个人设置</h1>
      </div>

      <div className="mb-6 pr-6 pl-6">
        <h3 className="mb-3 text-[14px] font-medium text-primary-600">个人使用偏好</h3>
        
        <div className="mb-3 pt-[18px] pr-[18px] pb-[18px] pl-[18px] rounded-[6px] bg-primary-100">
          <button 
            onClick={() => onNavigateToSetting('handedness')}
            className="w-full flex justify-between items-center"
          >
            <div className="flex items-center gap-3">
              <Hand size={20} className="text-primary-400" />
              <span className="text-[12px] text-primary-600">操作习惯</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-primary-300">
                {preferences.handedness === 'right' ? '右手模式' : '左手模式'}
              </span>
              <ChevronRight size={20} className="text-primary-300" />
            </div>
          </button>
        </div>

        <div className="mb-3 pt-[18px] pr-[18px] pb-[18px] pl-[18px] rounded-[6px] bg-primary-100">
          <button 
            onClick={() => onNavigateToSetting('height')}
            className="w-full flex justify-between items-center"
          >
            <div className="flex items-center gap-3">
              <Ruler size={20} className="text-primary-400" />
              <span className="text-[12px] text-primary-600">身高设置</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-primary-300">{preferences.height} cm</span>
              <ChevronRight size={20} className="text-primary-300" />
            </div>
          </button>
        </div>

        <div className="pt-[18px] pr-[18px] pb-[18px] pl-[18px] rounded-[6px] bg-primary-100">
          <button 
            onClick={() => onNavigateToSetting('voice')}
            className="w-full flex justify-between items-center"
          >
            <div className="flex items-center gap-3">
              <Volume2 size={20} className="text-primary-400" />
              <span className="text-[12px] text-primary-600">语音导航</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-primary-300">
                {preferences.voiceNavigation ? '已开启' : '已关闭'}
              </span>
              <ChevronRight size={20} className="text-primary-300" />
            </div>
          </button>
        </div>
      </div>

      <div className="mb-6 pr-6 pl-6">
        <h3 className="mb-3 text-[14px] font-medium text-primary-600">常用目的地</h3>
        
        {destinations.map((destination) => (
          <div key={destination.id} className="mb-3 pt-[18px] pr-[18px] pb-[18px] pl-[18px] rounded-[6px] bg-primary-100">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                {destination.icon === 'home' ? (
                  <Home size={20} className="text-primary-400" />
                ) : (
                  <Briefcase size={20} className="text-primary-400" />
                )}
                <span className="text-[12px] text-primary-600">{destination.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-primary-300">{destination.address}</span>
                <button onClick={() => onDestinationEdit(destination)}>
                  <Edit size={20} className="text-primary-300" />
                </button>
              </div>
            </div>
          </div>
        ))}

        <div className="pt-[18px] pr-[18px] pb-[18px] pl-[18px] rounded-[6px] bg-white">
          <button onClick={onAddDestination} className="flex justify-center items-center w-full">
            <Plus size={20} className="text-primary-500 mr-2" />
            <span className="text-[12px] text-primary-500">添加新地点</span>
          </button>
        </div>
      </div>

      <div className="mb-6 pr-6 pl-6">
        <h3 className="mb-3 text-[14px] font-medium text-primary-600">障碍物信息</h3>
        
        <div className="mb-3 pt-[18px] pr-[18px] pb-[18px] pl-[18px] rounded-[6px] bg-primary-100">
          <button 
            onClick={onReportObstacle}
            className="w-full flex justify-between items-center"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle size={20} className="text-primary-400" />
              <span className="text-[12px] text-primary-600">上报障碍物</span>
            </div>
            <ChevronRight size={20} className="text-primary-300" />
          </button>
        </div>

        <div className="pt-[18px] pr-[18px] pb-[18px] pl-[18px] rounded-[6px] bg-primary-100">
          <button 
            onClick={onViewContributions}
            className="w-full flex justify-between items-center"
          >
            <div className="flex items-center gap-3">
              <Medal size={20} className="text-primary-400" />
              <span className="text-[12px] text-primary-600">我的贡献</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-primary-300">12条</span>
              <ChevronRight size={20} className="text-primary-300" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings; 