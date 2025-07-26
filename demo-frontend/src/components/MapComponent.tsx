import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapComponentProps {
  className?: string;
  onMapClick?: (lat: number, lng: number) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({ className = '', onMapClick }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // 修复 Leaflet 默认图标的路径问题
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });

    // 创建地图实例
    const map = L.map(mapRef.current, {
      center: [39.9042, 116.4074], // 北京坐标
      zoom: 13,
      zoomControl: false, // 禁用默认缩放控件
      attributionControl: false, // 禁用默认属性控件
      dragging: true,
      touchZoom: true,
      scrollWheelZoom: false, // 禁用滚轮缩放
      doubleClickZoom: false, // 禁用双击缩放
    });

    // 添加 OpenStreetMap 瓦片图层
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // 添加当前位置标记
    L.marker([39.9042, 116.4074], {
      icon: L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: 20px;
            height: 20px;
            background: #2f2f2f;
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          "></div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      })
    }).addTo(map);

    // 添加障碍物标记
    L.marker([39.9042, 116.4074], {
      icon: L.divIcon({
        className: 'obstacle-marker',
        html: `
          <div style="
            width: 16px;
            height: 16px;
            background: #db8c98;
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            color: white;
            font-weight: bold;
          ">!</div>
        `,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      })
    }).addTo(map);

    // 添加点击事件
    map.on('click', (e) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    });

    // 添加一些示例路线（从当前位置到目的地）
    const routePoints = [
      [39.9042, 116.4074], // 起点
      [39.9042, 116.4074], // 中间点1
      [39.9042, 116.4074], // 中间点2
      [39.9042, 116.4074]  // 终点
    ];

    L.polyline(routePoints as [number, number][], {
      color: '#2f2f2f',
      weight: 3,
      opacity: 0.8,
      dashArray: '5, 10' // 虚线效果
    }).addTo(map);

    // 添加目的地标记
    L.marker([39.9042, 116.4074], {
      icon: L.divIcon({
        className: 'destination-marker',
        html: `
          <div style="
            width: 24px;
            height: 24px;
            background: #2f2f2f;
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: white;
            font-weight: bold;
          ">🏁</div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      })
    }).addTo(map);

    mapInstanceRef.current = map;

    // 清理函数
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [onMapClick]);

  return (
    <div 
      ref={mapRef} 
      className={`w-full h-full map-container ${className}`}
      style={{ 
        background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
        minHeight: '400px'
      }}
    />
  );
};

export default MapComponent; 