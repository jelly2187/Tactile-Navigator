import React from 'react';
import { ArrowLeft, MoreVertical, AlertTriangle, Crosshair, Layers, Accessibility } from 'lucide-react';
import type { NavigationRoute } from '../types';
import MapComponent from './MapComponent';

interface RouteDisplayProps {
  route: NavigationRoute;
  onBack: () => void;
  onStartNavigation: () => void;
  onConfirmObstacle: () => void;
}

const RouteDisplay: React.FC<RouteDisplayProps> = ({
  route,
  onBack,
  onStartNavigation,
  onConfirmObstacle,
}) => {
  return (
    <div className="flex flex-col justify-between w-[390px] min-h-[844px] bg-primary-50">
      {/* 头部导航 */}
      <div className="pt-3 pr-6 pb-3 pl-6 bg-primary-50">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <button onClick={onBack} className="mr-3">
              <div className="flex justify-center items-center w-5 h-5">
                <ArrowLeft size={20} className="text-primary-600" />
              </div>
            </button>
            <h3 className="text-[14px] font-medium text-primary-600">
              {route.from} → {route.to}
            </h3>
          </div>
          <div className="flex items-center">
            <button>
              <div className="flex justify-center items-center w-5 h-5">
                <MoreVertical size={20} className="text-primary-600" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 地图显示区域 */}
      <div className="relative w-full h-[600px]">
        <MapComponent className="w-full h-full" />

        {/* 地图控制按钮 */}
        <div className="flex absolute right-6 bottom-24 flex-col gap-3">
          <button className="flex justify-center items-center w-12 h-12 rounded-full bg-white shadow-card">
            <div className="flex justify-center items-center w-6 h-6">
              <Crosshair size={24} className="text-primary-500" />
            </div>
          </button>
          <button className="flex justify-center items-center w-12 h-12 rounded-full bg-white shadow-card">
            <div className="flex justify-center items-center w-6 h-6">
              <Layers size={24} className="text-primary-500" />
            </div>
          </button>
          <button className="flex justify-center items-center w-12 h-12 rounded-full bg-white shadow-card">
            <div className="flex justify-center items-center w-6 h-6">
              <Accessibility size={24} className="text-primary-500" />
            </div>
          </button>
        </div>

        {/* 障碍物提示卡片 */}
        <div className="absolute bottom-24 left-6 max-w-[240px] pt-4 pr-4 pb-4 pl-4 rounded-[8px] bg-white shadow-card">
          <div className="flex items-start gap-3">
            <div className="flex justify-center items-center w-6 h-6 mt-1">
              <AlertTriangle size={24} className="text-warning-500" />
            </div>
            <div>
              <h4 className="mb-1 text-[14px] font-medium text-primary-600">前方道路维修</h4>
              <p className="text-[12px] text-primary-400">已为您重新规划路线，避开前方施工区域</p>
            </div>
          </div>
          <div className="flex justify-end mt-3">
            <button
              onClick={onConfirmObstacle}
              className="pt-2 pr-4 pb-2 pl-4 rounded-[6px] bg-primary-500 text-white text-[12px]"
            >
              确认
            </button>
          </div>
        </div>
      </div>

      {/* 导航信息卡片 */}
      <div className="relative mt-[-20px] mr-4 ml-4 pt-4 pr-4 pb-4 pl-4 rounded-[8px] bg-white shadow-card z-10">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-[14px] font-medium text-primary-600">
              预计到达时间: {route.estimatedTime}分钟
            </h3>
            <p className="mt-1 text-[12px] text-primary-400">距离: {route.distance}米</p>
          </div>
          <button
            onClick={onStartNavigation}
            className="pt-2 pr-4 pb-2 pl-4 rounded-[6px] bg-primary-500 text-white"
          >
            开始
          </button>
        </div>
      </div>
    </div>
  );
};

export default RouteDisplay; 