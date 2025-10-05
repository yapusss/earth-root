
export interface Player {
  resources: number;
  ecoPoints: number;
}

export interface Crop {
  id: string;
  name: string;
  growthTime: number; // in turns
  waterNeed: number; // 0-1
  heatTolerance: number; // 0-1
  cost: number;
  icon: string;
}

export interface Plot {
  id: number;
  crop: Crop | null;
  growthStage: number; // 0-1
  health: number; // 0-100
  soilMoisture: number; // 0-1
  nutrientLevel: number; // 0-1
  temperature: number; // 0-1 (normalized)
}

export enum GamePhase {
  Observation = 'OBSERVATION',
  Planning = 'PLANNING & ACTION',
  Evaluation = 'EVALUATION & HARVEST',
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  effect: (gameState: GameState) => GameState;
  duration: number; // in turns
  turnTriggered: number;
}

export interface Location {
  id: string;
  name: string;
  description: string;
  icon: string;
  baseTemperature: [number, number]; // min, max range for randomization (0-1)
  baseSoilMoisture: [number, number];
  baseNutrientLevel: [number, number];
  weatherChances: {
    Sunny: number;
    Rainy: number;
    Stormy: number;
  };
}

export type WeatherType = 'Sunny' | 'Rainy' | 'Stormy' | 'Heatwave';
export interface Weather {
  type: WeatherType;
  description: string;
}

export interface Alert {
  id: string;
  plotId: number;
  type: 'low-moisture' | 'low-nutrients' | 'harvest' | 'plant-death';
  message: string;
}

export interface GameState {
  turn: number;
  phase: GamePhase; // Kept for potential future use, but flow is now turn-based
  player: Player;
  plots: Plot[];
  currentEvent: GameEvent | null;
  eventLog: string[];
  alerts: Alert[];
  location: Location | null;
  weather: Weather;
}

export type PlayerAction = 'plant' | 'water' | 'fertilize';

export type OverlayType = 'none' | 'soilMoisture' | 'temperature' | 'nutrientLevel' | 'vegetation';

export type GameStatus = 'MainMenu' | 'LocationSelection' | 'InGame';