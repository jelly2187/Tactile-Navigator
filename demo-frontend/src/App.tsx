import React, { useState } from 'react';
import StatusBar from './components/StatusBar';
import BottomNavigation from './components/BottomNavigation';
import NavigationSearch from './components/NavigationSearch';
import RouteDisplay from './components/RouteDisplay';
import DeparturePage from './components/DeparturePage';
import ProfileSettings from './components/ProfileSettings';
import ObstacleInfo from './components/ObstacleInfo';
import FamilyPage from './components/FamilyPage';
import HandednessSetting from './components/settings/HandednessSetting';
import HeightSetting from './components/settings/HeightSetting';
import VoiceSetting from './components/settings/VoiceSetting';
import type { TabType, Destination, UserPreferences, NavigationRoute, Obstacle, FamilyMember } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('navigation');
  const [currentRoute, setCurrentRoute] = useState<NavigationRoute | null>(null);
  const [showRouteDisplay, setShowRouteDisplay] = useState(false);
  const [currentSetting, setCurrentSetting] = useState<string | null>(null);

  // 模拟数据
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    handedness: 'right',
    height: 175,
    voiceNavigation: true,
  });

  const [destinations] = useState<Destination[]>([
    { id: '1', name: '家', icon: 'home', address: '东城区东直门' },
    { id: '2', name: '公司', icon: 'briefcase', address: '朝阳区望京' },
  ]);

  const mockRoute: NavigationRoute = {
    id: '1',
    from: '当前位置',
    to: '目的地',
    estimatedTime: 5,
    distance: 450,
    obstacles: [],
  };

  const [obstacles] = useState<Obstacle[]>([
    {
      id: '1',
      type: '道路维修',
      location: '田社里街道',
      description: '前方道路正在进行维修施工，建议绕行',
      reportedBy: '张先生',
      reportedAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      type: '积水路段',
      location: '建国门外大街',
      description: '雨后路面有积水，深度约10厘米，请注意安全',
      reportedBy: '李女士',
      reportedAt: new Date('2024-01-16'),
    },
    {
      id: '3',
      type: '施工围挡',
      location: '朝阳门外大街',
      description: '人行道被施工围挡占用，需要绕行到马路对面',
      reportedBy: '王先生',
      reportedAt: new Date('2024-01-17'),
    },
  ]);

  const [familyMembers] = useState<FamilyMember[]>([
    {
      id: '1',
      name: '张小明',
      relationship: '父亲',
      phone: '138****1234',
      isEmergency: true,
    },
    {
      id: '2',
      name: '李小红',
      relationship: '母亲',
      phone: '139****5678',
      isEmergency: true,
    },
    {
      id: '3',
      name: '张小华',
      relationship: '姐姐',
      phone: '137****9012',
      isEmergency: false,
    },
  ]);

  // 页面跳转处理函数
  const handleSearch = (query: string) => {
    setCurrentRoute({ ...mockRoute, to: query });
    setShowRouteDisplay(true);
  };

  const handleDestinationSelect = (destination: Destination) => {
    setCurrentRoute({ ...mockRoute, to: destination.name });
    setShowRouteDisplay(true);
  };

  const handleVoiceSearch = () => {
    alert('语音搜索功能开发中...');
  };

  const handleConfirmObstacle = () => {
    alert('已确认障碍物信息');
  };

  const handleBack = () => {
    if (currentSetting) {
      setCurrentSetting(null);
    } else if (showRouteDisplay) {
      setShowRouteDisplay(false);
      setCurrentRoute(null);
    }
  };

  const handleStartNavigation = () => {
    alert('开始导航到目的地');
  };

  const handleDestinationEdit = (destination: Destination) => {
    alert(`编辑目的地: ${destination.name}`);
  };

  const handleAddDestination = () => {
    alert('添加新目的地功能开发中...');
  };

  const handleReportObstacle = () => {
    alert('上报障碍物功能开发中...');
  };

  const handleViewContributions = () => {
    alert('查看贡献记录功能开发中...');
  };

  const handleNavigateToSetting = (setting: string) => {
    setCurrentSetting(setting);
  };

  const handleSaveHandedness = (handedness: 'left' | 'right') => {
    setUserPreferences(prev => ({ ...prev, handedness }));
    setCurrentSetting(null);
  };

  const handleSaveHeight = (height: number) => {
    setUserPreferences(prev => ({ ...prev, height }));
    setCurrentSetting(null);
  };

  const handleSaveVoice = (voiceNavigation: boolean) => {
    setUserPreferences(prev => ({ ...prev, voiceNavigation }));
    setCurrentSetting(null);
  };

  const handleAddObstacle = () => {
    alert('添加障碍物功能开发中...');
  };

  const handleObstacleClick = (obstacle: Obstacle) => {
    alert(`查看障碍物详情: ${obstacle.type}`);
  };

  const handleAddMember = () => {
    alert('添加家人功能开发中...');
  };

  const handleCallMember = (member: FamilyMember) => {
    alert(`拨打电话给 ${member.name}: ${member.phone}`);
  };

  const handleEditMember = (member: FamilyMember) => {
    alert(`编辑家人信息: ${member.name}`);
  };

  // 渲染当前页面内容
  const renderContent = () => {
    if (currentSetting) {
      switch (currentSetting) {
        case 'handedness':
          return (
            <HandednessSetting
              currentHandedness={userPreferences.handedness}
              onBack={handleBack}
              onSave={handleSaveHandedness}
            />
          );
        case 'height':
          return (
            <HeightSetting
              currentHeight={userPreferences.height}
              onBack={handleBack}
              onSave={handleSaveHeight}
            />
          );
        case 'voice':
          return (
            <VoiceSetting
              voiceEnabled={userPreferences.voiceNavigation}
              onBack={handleBack}
              onSave={handleSaveVoice}
            />
          );
        default:
          return null;
      }
    }

    if (showRouteDisplay && currentRoute) {
      return (
        <RouteDisplay
          route={currentRoute}
          onBack={handleBack}
          onStartNavigation={handleStartNavigation}
          onConfirmObstacle={handleConfirmObstacle}
        />
      );
    }

    switch (activeTab) {
      case 'navigation':
        return (
          <NavigationSearch
            onSearch={handleSearch}
            onDestinationSelect={handleDestinationSelect}
            onVoiceSearch={handleVoiceSearch}
          />
        );
      case 'departure':
        return <DeparturePage />;
      case 'profile':
        return (
          <ProfileSettings
            preferences={userPreferences}
            destinations={destinations}
            onDestinationEdit={handleDestinationEdit}
            onAddDestination={handleAddDestination}
            onReportObstacle={handleReportObstacle}
            onViewContributions={handleViewContributions}
            onNavigateToSetting={handleNavigateToSetting}
          />
        );
      case 'family':
        return (
          <FamilyPage
            familyMembers={familyMembers}
            onBack={handleBack}
            onAddMember={handleAddMember}
            onCallMember={handleCallMember}
            onEditMember={handleEditMember}
          />
        );
      case 'obstacle':
        return (
          <ObstacleInfo
            obstacles={obstacles}
            onBack={handleBack}
            onAddObstacle={handleAddObstacle}
            onObstacleClick={handleObstacleClick}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="relative">
        <StatusBar />
        {renderContent()}
        {!currentSetting && !showRouteDisplay && (
          <BottomNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        )}
      </div>
    </div>
  );
};

export default App;
