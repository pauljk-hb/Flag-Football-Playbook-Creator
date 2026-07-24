export interface PlayerPreset {
  id: string;
  label: string;
  color: string;
  shape: 'circle' | 'square';
}

export interface RoutePreset {
  id: string;
  name: string;
  waypoints: { dx: number; dy: number }[]; 
}

export interface FormationPreset {
  id: string;
  name: string;
  positions: FormationPosition[];
}

export interface FormationPosition {
  playerPresetId: string;
  dx: number;
  dy: number;
}

export interface FieldLineConfig {
    yardsFromLos: number;
    type: 'los' | 'yardline' | 'endzone';
}

export interface FieldPreset {
    id: string;
    name: string;
    lines: FieldLineConfig[];
    anchor: { x: number, y: number };
}