import React from 'react';
import { Navigation } from 'lucide-react';

const DeparturePage: React.FC = () => {
  return (
    <div className="flex flex-col justify-between w-[390px] min-h-[844px] bg-primary-50">
      <div className="pt-4 pr-6 pb-4 pl-6">
        <h1 className="text-[20px] font-medium text-primary-600">出发</h1>
      </div>

      <div className="flex-1 pr-6 pl-6">
        <div className="relative w-full h-[600px] bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg overflow-hidden">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 350 600"
            className="absolute inset-0"
          >
            {/* 起点 (绿色) */}
            <circle
              cx="50"
              cy="500"
              r="12"
              fill="#10B981"
              stroke="#ffffff"
              strokeWidth="3"
            />
            <text
              x="50"
              y="520"
              textAnchor="middle"
              className="text-xs font-medium fill-primary-600"
            >
              起点
            </text>

            {/* 终点 (红色) */}
            <circle
              cx="300"
              cy="100"
              r="12"
              fill="#EF4444"
              stroke="#ffffff"
              strokeWidth="3"
            />
            <text
              x="300"
              y="120"
              textAnchor="middle"
              className="text-xs font-medium fill-primary-600"
            >
              终点
            </text>

            {/* 连接点 1 (黑色) */}
            <circle
              cx="120"
              cy="400"
              r="8"
              fill="#374151"
              stroke="#ffffff"
              strokeWidth="2"
            />

            {/* 连接点 2 (黑色) */}
            <circle
              cx="200"
              cy="300"
              r="8"
              fill="#374151"
              stroke="#ffffff"
              strokeWidth="2"
            />

            {/* 连接点 3 (黑色) */}
            <circle
              cx="250"
              cy="200"
              r="8"
              fill="#374151"
              stroke="#ffffff"
              strokeWidth="2"
            />

            {/* 连接点 4 (黑色) */}
            <circle
              cx="180"
              cy="150"
              r="8"
              fill="#374151"
              stroke="#ffffff"
              strokeWidth="2"
            />

            {/* 路线连接线 */}
            <line
              x1="50"
              y1="500"
              x2="120"
              y2="400"
              stroke="#374151"
              strokeWidth="3"
              strokeLinecap="round"
            />

            <path
              d="M 120 400 Q 160 350 200 300"
              stroke="#374151"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />

            <line
              x1="200"
              y1="300"
              x2="250"
              y2="200"
              stroke="#374151"
              strokeWidth="3"
              strokeLinecap="round"
            />

            <path
              d="M 250 200 Q 215 175 180 150"
              stroke="#374151"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />

            <line
              x1="180"
              y1="150"
              x2="300"
              y2="100"
              stroke="#374151"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* 当前光标位置 (蓝色) */}
            <circle
              cx="160"
              cy="350"
              r="10"
              fill="#3B82F6"
              stroke="#ffffff"
              strokeWidth="3"
            />
            <circle
              cx="160"
              cy="350"
              r="16"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2"
              opacity="0.6"
            >
              <animate
                attributeName="r"
                values="16;20;16"
                dur="2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.6;0.2;0.6"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>

            <g transform="translate(160, 350)">
              <polygon
                points="0,-8 4,0 0,8 -4,0"
                fill="#3B82F6"
                transform="rotate(45)"
              />
            </g>

            <text
              x="85"
              y="450"
              className="text-xs fill-primary-500"
              textAnchor="middle"
            >
              150m
            </text>
            <text
              x="160"
              y="350"
              className="text-xs fill-primary-500"
              textAnchor="middle"
            >
              200m
            </text>
            <text
              x="225"
              y="250"
              className="text-xs fill-primary-500"
              textAnchor="middle"
            >
              180m
            </text>
            <text
              x="240"
              y="125"
              className="text-xs fill-primary-500"
              textAnchor="middle"
            >
              120m
            </text>
          </svg>

          <div className="absolute bottom-6 left-6 right-6 pt-4 pr-4 pb-4 pl-4 rounded-[8px] bg-white shadow-card">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-[14px] font-medium text-primary-600">
                  预计到达时间: 8分钟
                </h3>
                <p className="mt-1 text-[12px] text-primary-400">总距离: 650米</p>
                <p className="text-[12px] text-primary-400">当前位置: 路线中段</p>
              </div>
              <button className="pt-2 pr-4 pb-2 pl-4 rounded-[6px] bg-primary-500 text-white text-[12px]">
                继续导航
              </button>
            </div>
          </div>

          <div className="absolute right-6 top-6">
            <button className="flex justify-center items-center w-12 h-12 rounded-full bg-white shadow-card">
              <div className="flex justify-center items-center w-6 h-6">
                <Navigation size={24} className="text-primary-500" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeparturePage; 