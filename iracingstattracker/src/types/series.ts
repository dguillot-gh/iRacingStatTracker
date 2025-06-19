export type Category = 'road' | 'oval' | 'dirt_road' | 'dirt_oval';
export type LicenseClass = 'R' | 'D' | 'C' | 'B' | 'A' | 'P';
export type TrackType = 'road' | 'oval' | 'dirt';

export interface PointsSystem {
  win: number;
  second: number;
  third: number;
  pole?: number;
  leadLap?: number;
  mostLeadLaps?: number;
}

export interface Series {
  id: string;
  name: string;
  description: string;
  category: Category;
  licenseClass: LicenseClass;
  minLicenseLevel: number;
  seasonLength: number;
  isActive: boolean;
  cars: string[];
  defaultTrackType: TrackType;
  pointsSystem: PointsSystem;
  requiredRaces: number;
  droppedWeeks: number;
  isOfficial: boolean;
  createdAt: string;
  updatedAt: string;
} 