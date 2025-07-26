export interface Destination {
    id: string;
    name: string;
    icon: string;
    address?: string;
}

export interface UserPreferences {
    handedness: 'left' | 'right';
    height: number;
    voiceNavigation: boolean;
}

export interface Obstacle {
    id: string;
    type: string;
    location: string;
    description: string;
    reportedBy: string;
    reportedAt: Date;
}

export interface NavigationRoute {
    id: string;
    from: string;
    to: string;
    estimatedTime: number;
    distance: number;
    obstacles: Obstacle[];
}

export interface FamilyMember {
    id: string;
    name: string;
    relationship: string;
    phone: string;
    isEmergency: boolean;
}

export type TabType = 'navigation' | 'departure' | 'profile' | 'family' | 'obstacle'; 