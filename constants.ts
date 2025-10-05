
import { Crop, GamePhase, Location } from './types';

export const CROPS: Crop[] = [
  { id: 'wheat', name: 'Wheat', growthTime: 4, waterNeed: 0.5, heatTolerance: 0.6, cost: 50, icon: '🌾' },
  { id: 'corn', name: 'Corn', growthTime: 5, waterNeed: 0.7, heatTolerance: 0.8, cost: 70, icon: '🌽' },
  { id: 'soybean', name: 'Soybean', growthTime: 4, waterNeed: 0.6, heatTolerance: 0.7, cost: 60, icon: '🌱' },
  { id: 'potato', name: 'Potato', growthTime: 3, waterNeed: 0.8, heatTolerance: 0.4, cost: 40, icon: '🥔' },
  { id: 'sunflower', name: 'Sunflower', growthTime: 3, waterNeed: 0.4, heatTolerance: 0.9, cost: 30, icon: '🌻' },
];

export const GRID_SIZE = 16; // 4x4 grid

export const INITIAL_RESOURCES = 1000;
export const INITIAL_ECO_POINTS = 0;

export const PHASE_DESCRIPTIONS: Record<GamePhase, { title: string, description: string }> = {
  [GamePhase.Observation]: {
    title: "Phase 1: Observation",
    description: "Analyze satellite data. Check soil moisture, temperature, and nutrient levels to prepare for planting.",
  },
  [GamePhase.Planning]: {
    title: "Phase 2: Planning & Action",
    description: "Select crops and manage your fields. Plant, water, and fertilize based on your observations.",
  },
  [GamePhase.Evaluation]: {
    title: "Phase 3: Evaluation & Harvest",
    description: "Crops grow and are harvested. See the results of your decisions and prepare for the next season.",
  },
};

export const LOCATIONS: Location[] = [
    {
        id: 'great-plains',
        name: 'Great Plains',
        description: 'A temperate region with balanced seasons but prone to sudden heatwaves. Fertile soil provides a great start for staple crops.',
        icon: '🏞️',
        baseTemperature: [0.5, 0.7],
        baseSoilMoisture: [0.4, 0.6],
        baseNutrientLevel: [0.6, 0.8],
        weatherChances: { Sunny: 0.6, Rainy: 0.3, Stormy: 0.1 },
    },
    {
        id: 'mekong-delta',
        name: 'Mekong Delta',
        description: 'A hot, humid, tropical environment with high rainfall. Soil is rich but can easily become waterlogged, risking root rot.',
        icon: '🌊',
        baseTemperature: [0.7, 0.9],
        baseSoilMoisture: [0.7, 0.9],
        baseNutrientLevel: [0.5, 0.7],
        weatherChances: { Sunny: 0.3, Rainy: 0.6, Stormy: 0.1 },
    },
    {
        id: 'andean-highlands',
        name: 'Andean Highlands',
        description: 'A cool, mountainous region with thin air and intense sun. The soil is less fertile, requiring careful management. Hardy crops thrive here.',
        icon: '🏔️',
        baseTemperature: [0.2, 0.4],
        baseSoilMoisture: [0.3, 0.5],
        baseNutrientLevel: [0.3, 0.5],
        weatherChances: { Sunny: 0.7, Rainy: 0.2, Stormy: 0.1 },
    }
];
