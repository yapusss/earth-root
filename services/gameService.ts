
import { GameState, GamePhase, Plot, GameEvent, Location, Weather, WeatherType, Alert } from '../types';
import { GRID_SIZE, INITIAL_RESOURCES, INITIAL_ECO_POINTS } from '../constants';

const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;

const createInitialPlots = (location: Location): Plot[] => {
  return Array.from({ length: GRID_SIZE }, (_, i) => ({
    id: i,
    crop: null,
    growthStage: 0,
    health: 100,
    soilMoisture: randomBetween(...location.baseSoilMoisture),
    nutrientLevel: randomBetween(...location.baseNutrientLevel),
    temperature: randomBetween(...location.baseTemperature),
  }));
};

const determineWeather = (location: Location): Weather => {
    const roll = Math.random();
    let cumulative = 0;
    for (const [weather, chance] of Object.entries(location.weatherChances)) {
        cumulative += chance;
        if (roll < cumulative) {
            const type = weather as WeatherType;
            let description = '';
            switch(type) {
                case 'Sunny': description = 'Clear skies. Expect increased evaporation.'; break;
                case 'Rainy': description = 'Light rain is nourishing the soil.'; break;
                case 'Stormy': description = 'Heavy rain and wind. Risk of soil erosion.'; break;
            }
            return { type, description };
        }
    }
    return { type: 'Sunny', description: 'Clear skies. Expect increased evaporation.' }; // Fallback
};

const gameEvents: Omit<GameEvent, 'turnTriggered'>[] = [
  {
    id: 'heatwave',
    title: 'Extreme Heat Pathfinder Alert!',
    description: 'A severe heatwave is sweeping the area. Heat-sensitive crops are at risk!',
    duration: 2,
    effect: (gs) => {
      const newPlots = gs.plots.map(p => ({ ...p, temperature: Math.min(1, p.temperature + 0.3) }));
      return { ...gs, plots: newPlots, eventLog: [...gs.eventLog, `Heatwave event started.`] };
    }
  },
  {
    id: 'pest_outbreak',
    title: 'Pest Outbreak!',
    description: 'A swarm of pests is damaging crops. Crop health will decline without intervention.',
    duration: 3,
    effect: (gs) => {
      gs.eventLog.push('A pest outbreak is damaging unprotected crops!');
      return gs; // Effect applied during growth phase
    }
  }
];

export const getInitialGameState = (location: Location): GameState => ({
  turn: 1,
  phase: GamePhase.Planning, // Default to planning phase
  player: {
    resources: INITIAL_RESOURCES,
    ecoPoints: INITIAL_ECO_POINTS,
  },
  plots: createInitialPlots(location),
  currentEvent: null,
  eventLog: ['Ceres online. Welcome, Farmer. Your first datastream from the orbital sensors is coming in now. Let\'s get to work.'],
  alerts: [],
  location: location,
  weather: { type: 'Sunny', description: 'The forecast is clear for your first day.' }
});

const processGrowth = (gs: GameState): GameState => {
  let harvestedResources = 0;
  let harvestedEcoPoints = 0;
  const alertsForTurn: Alert[] = [];

  const newPlots = gs.plots.map(plot => {
    if (!plot.crop) return plot;

    let updatedPlot = { ...plot };
    let healthModifier = 0;
    
    // Weather effects
    if (gs.weather.type === 'Sunny') updatedPlot.soilMoisture -= 0.08;
    if (gs.weather.type === 'Rainy') updatedPlot.soilMoisture += 0.15;
    if (gs.weather.type === 'Stormy') updatedPlot.soilMoisture += 0.25;
    
    // Clamp moisture
    updatedPlot.soilMoisture = Math.max(0, Math.min(1, updatedPlot.soilMoisture));

    // DYNAMIC RISKS
    // 1. Waterlogging
    if (updatedPlot.soilMoisture > 0.95) {
        healthModifier -= 15;
        gs.eventLog.push(`Plot ${plot.id+1} is waterlogged, harming ${plot.crop.name}!`);
    }
    
    // 2. Water stress
    if (updatedPlot.soilMoisture < updatedPlot.crop.waterNeed) {
        healthModifier -= 5;
        alertsForTurn.push({
            id: `${plot.id}-low-moisture-${gs.turn}`,
            plotId: plot.id,
            type: 'low-moisture',
            message: `Plot ${plot.id + 1} (${plot.crop.name}) needs water.`
        });
    }
    
    // 3. Heat stress
    if (updatedPlot.temperature > updatedPlot.crop.heatTolerance) healthModifier -= 10;
    
    // 4. Nutrient stress
    if (updatedPlot.nutrientLevel < 0.3) {
        healthModifier -= 5;
        alertsForTurn.push({
            id: `${plot.id}-low-nutrients-${gs.turn}`,
            plotId: plot.id,
            type: 'low-nutrients',
            message: `Plot ${plot.id + 1} (${plot.crop.name}) is low on nutrients.`
        });
    } else {
        updatedPlot.nutrientLevel -= 0.05; // Crops consume nutrients
    }

    // 5. Event stress (e.g., pests)
    if(gs.currentEvent?.id === 'pest_outbreak') healthModifier -= 10;

    updatedPlot.health = Math.max(0, updatedPlot.health + healthModifier);
    
    if (updatedPlot.health <= 0) {
        alertsForTurn.push({
            id: `${plot.id}-plant-death-${gs.turn}`,
            plotId: plot.id,
            type: 'plant-death',
            message: `${plot.crop.name} on Plot ${plot.id + 1} has withered away.`
        });
        // Reset plot, crop is gone
        return { ...updatedPlot, crop: null, growthStage: 0, health: 100 };
    }

    if (updatedPlot.health > 0) {
      updatedPlot.growthStage += 1 / updatedPlot.crop.growthTime;
    }

    // Harvest
    if (updatedPlot.growthStage >= 1) {
      const yieldModifier = updatedPlot.health / 100;
      const harvestValue = (updatedPlot.crop.cost * 2.5) * yieldModifier;
      const roundedHarvestValue = Math.round(harvestValue);
      harvestedResources += roundedHarvestValue;
      harvestedEcoPoints += Math.round(5 * yieldModifier);
      gs.eventLog.push(`Harvested ${updatedPlot.crop.name} from Plot ${plot.id+1} for $${roundedHarvestValue}.`);
      
      alertsForTurn.push({
        id: `${plot.id}-harvest-${gs.turn}`,
        plotId: plot.id,
        type: 'harvest',
        message: `Plot ${plot.id + 1}: +$${roundedHarvestValue} from ${plot.crop.name}.`
      });

      return { ...updatedPlot, crop: null, growthStage: 0, health: 100 }; // Reset plot
    }
    
    return updatedPlot;
  });

  return {
    ...gs,
    plots: newPlots,
    alerts: alertsForTurn,
    player: {
      resources: gs.player.resources + harvestedResources,
      ecoPoints: gs.player.ecoPoints + harvestedEcoPoints,
    }
  };
};


export const advanceTurn = (currentState: GameState): GameState => {
  let newState = { ...currentState };

  // 1. Determine weather for the new turn
  newState.weather = determineWeather(newState.location!);
  newState.eventLog.push(`Weather Forecast: ${newState.weather.type}. ${newState.weather.description}`);
  
  // 2. Process growth, environment, and harvest based on PREVIOUS turn's state and NEW weather
  newState = processGrowth(newState);
  
  // 3. Advance turn number
  newState.turn += 1;
  newState.eventLog.push(`--- Season ${newState.turn} ---`);

  // 4. Update event status
  if (newState.currentEvent) {
    const eventEndTurn = newState.currentEvent.turnTriggered + newState.currentEvent.duration;
    if (newState.turn >= eventEndTurn) {
      newState.eventLog.push(`${newState.currentEvent.title} event has ended.`);
      newState.currentEvent = null;
    }
  }

  // 5. Trigger new event randomly
  if (!newState.currentEvent && Math.random() > 0.7) { // 30% chance
    const randomEventTemplate = gameEvents[Math.floor(Math.random() * gameEvents.length)];
    const newEvent: GameEvent = {
        ...randomEventTemplate,
        turnTriggered: newState.turn
    };
    newState.currentEvent = newEvent;
    newState = newEvent.effect(newState); // Apply initial effect
  }

  return newState;
};