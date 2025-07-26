import React from 'react';
import { Wifi, Signal, Battery } from 'lucide-react';

const StatusBar: React.FC = () => {
  return (
    <div className="text-sm flex justify-between items-center h-11 pr-6 pl-6 font-medium bg-primary-50 text-primary-600">
      <div className="time">9:41</div>
      <div className="text-xs flex gap-1.5">
        <Signal size={12} />
        <Wifi size={12} />
        <Battery size={12} />
      </div>
    </div>
  );
};

export default StatusBar; 