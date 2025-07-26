import React from 'react';
import { ArrowLeft, Plus, AlertTriangle, MapPin, Calendar, User } from 'lucide-react';
import type { Obstacle } from '../types';

interface ObstacleInfoProps {
  obstacles: Obstacle[];
  onBack: () => void;
  onAddObstacle: () => void;
  onObstacleClick: (obstacle: Obstacle) => void;
}

const ObstacleInfo: React.FC<ObstacleInfoProps> = ({
  obstacles,
  onBack,
  onAddObstacle,
  onObstacleClick,
}) => {
  return (
    <div className="flex flex-col justify-between w-[390px] min-h-[844px] bg-primary-50">
      {/* 头部导航 */}
      <div className="pt-3 pr-6 pb-3 pl-6 bg-primary-50">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <button onClick={onBack} className="mr-3">
              <ArrowLeft size={20} className="text-primary-600" />
            </button>
            <h3 className="text-[14px] font-medium text-primary-600">障碍物信息</h3>
          </div>
          <button onClick={onAddObstacle}>
            <Plus size={20} className="text-primary-600" />
          </button>
        </div>
      </div>

      {/* 障碍物列表 */}
      <div className="flex-1 pr-6 pl-6">
        <h3 className="mb-3 text-[14px] font-medium text-primary-600">附近障碍物</h3>
        
        {obstacles.map((obstacle) => (
          <div 
            key={obstacle.id} 
            className="mb-3 pt-4 pr-4 pb-4 pl-4 rounded-[8px] bg-white shadow-card"
            onClick={() => onObstacleClick(obstacle)}
          >
            <div className="flex items-start gap-3">
              <div className="flex justify-center items-center w-8 h-8 rounded-full bg-warning-100">
                <AlertTriangle size={20} className="text-warning-500" />
              </div>
              <div className="flex-1">
                <h4 className="mb-1 text-[14px] font-medium text-primary-600">{obstacle.type}</h4>
                <p className="mb-2 text-[12px] text-primary-400">{obstacle.description}</p>
                <div className="flex items-center gap-4 text-[10px] text-primary-300">
                  <div className="flex items-center gap-1">
                    <MapPin size={12} />
                    <span>{obstacle.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>{obstacle.reportedAt.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User size={12} />
                    <span>{obstacle.reportedBy}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {obstacles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertTriangle size={48} className="text-primary-300 mb-4" />
            <p className="text-[14px] text-primary-400 mb-2">暂无障碍物信息</p>
            <p className="text-[12px] text-primary-300">点击右上角添加按钮上报障碍物</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ObstacleInfo; 