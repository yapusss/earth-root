
import React from 'react';
import { GameState, Plot, OverlayType, PlayerAction, Crop } from '../types';
import { FarmGrid } from './FarmGrid';
import { SidePanel } from './SidePanel';

interface GameDashboardProps {
  gameState: GameState;
  selectedPlot: Plot | null;
  activeOverlay: OverlayType;
  onPlotSelect: (plot: Plot) => void;
  onPlayerAction: (action: PlayerAction, plotId: number, crop?: Crop) => void;
  onSetOverlay: (overlay: OverlayType) => void;
  onAskAi: () => void;
  isPaused: boolean;
  gameSpeed: number;
  onPauseToggle: () => void;
  onSetSpeed: (speed: number) => void;
}

const weatherIcons: { [key: string]: string } = {
  Sunny: '☀️',
  Rainy: '🌦️',
  Stormy: '⛈️',
  Heatwave: '🔥'
}

export const GameDashboard: React.FC<GameDashboardProps> = ({
  gameState,
  selectedPlot,
  activeOverlay,
  onPlotSelect,
  onPlayerAction,
  onSetOverlay,
  onAskAi,
  isPaused,
  gameSpeed,
  onPauseToggle,
  onSetSpeed,
}) => {
  const handleSelectPlotById = (plotId: number) => {
    const plotToSelect = gameState.plots.find(p => p.id === plotId);
    if (plotToSelect) {
        onPlotSelect(plotToSelect);
    }
  };

  return (
    <div className="flex flex-col h-screen p-4 gap-4">
      <header className="text-center">
        <h1 className="text-3xl font-bold text-emerald-400 tracking-wider">
          {gameState.location?.name} Farm
        </h1>
        <div className="text-slate-400 text-lg flex items-center justify-center gap-4">
            <span>Season: {gameState.turn}</span>
            <span>Weather: {gameState.weather.type} {weatherIcons[gameState.weather.type]}</span>
        </div>
      </header>
      <main className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-120px)]">
        <div className="lg:col-span-3 bg-slate-800/50 rounded-lg p-4 flex items-center justify-center">
          <FarmGrid 
            plots={gameState.plots}
            onPlotSelect={onPlotSelect}
            selectedPlotId={selectedPlot?.id}
            activeOverlay={activeOverlay}
          />
        </div>
        <div className="lg:col-span-1 bg-slate-800/50 rounded-lg p-4 overflow-y-auto">
          <SidePanel 
            gameState={gameState}
            selectedPlot={selectedPlot}
            activeOverlay={activeOverlay}
            onPlayerAction={onPlayerAction}
            onSetOverlay={onSetOverlay}
            onAskAi={onAskAi}
            isPaused={isPaused}
            gameSpeed={gameSpeed}
            onPauseToggle={onPauseToggle}
            onSetSpeed={onSetSpeed}
            onSelectPlotById={handleSelectPlotById}
          />
        </div>
      </main>
    </div>
  );
};