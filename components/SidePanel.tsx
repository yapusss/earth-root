
import React, { useState } from 'react';
import { GameState, Plot, OverlayType, PlayerAction, Crop, Alert } from '../types';
import { CROPS } from '../constants';

interface SidePanelProps {
  gameState: GameState;
  selectedPlot: Plot | null;
  activeOverlay: OverlayType;
  onPlayerAction: (action: PlayerAction, plotId: number, crop?: Crop) => void;
  onSetOverlay: (overlay: OverlayType) => void;
  onAskAi: () => void;
  isPaused: boolean;
  gameSpeed: number;
  onPauseToggle: () => void;
  onSetSpeed: (speed: number) => void;
  onSelectPlotById: (plotId: number) => void;
}

const StatCard: React.FC<{ icon: string; label: string; value: string | number; color: string }> = ({ icon, label, value, color }) => (
  <div className="bg-slate-700/50 p-3 rounded-lg flex items-center gap-3">
    <div className={`text-3xl ${color}`}>{icon}</div>
    <div>
      <div className="text-slate-400 text-sm">{label}</div>
      <div className="text-white font-bold text-lg">{value}</div>
    </div>
  </div>
);

const OverlayButton: React.FC<{ label: string; type: OverlayType; active: OverlayType; onClick: (type: OverlayType) => void }> = ({ label, type, active, onClick}) => (
    <button onClick={() => onClick(type)} className={`px-3 py-1 text-sm rounded-full transition-colors ${active === type ? 'bg-emerald-500 text-white' : 'bg-slate-600 hover:bg-slate-500 text-slate-300'}`}>
        {label}
    </button>
);

type AlertStyle = {
  icon: string;
  title: string;
  className: string;
  titleColor: string;
};

const getAlertStyle = (type: Alert['type']): AlertStyle => {
    switch (type) {
        case 'low-moisture':
            return {
                icon: '💧',
                title: 'Low Moisture',
                className: 'bg-amber-900/60 hover:bg-amber-800/70',
                titleColor: 'text-amber-200',
            };
        case 'low-nutrients':
            return {
                icon: '🌿',
                title: 'Nutrient Deficiency',
                className: 'bg-amber-900/60 hover:bg-amber-800/70',
                titleColor: 'text-amber-200',
            };
        case 'harvest':
            return {
                icon: '🎉',
                title: 'Successful Harvest',
                className: 'bg-green-900/60 hover:bg-green-800/70',
                titleColor: 'text-green-200',
            };
        case 'plant-death':
            return {
                icon: '💀',
                title: 'Crop Lost',
                className: 'bg-red-900/60 hover:bg-red-800/70',
                titleColor: 'text-red-200',
            };
        default:
            return {
                icon: '🔔',
                title: 'Alert',
                className: 'bg-slate-700 hover:bg-slate-600',
                titleColor: 'text-slate-200',
            };
    }
};


export const SidePanel: React.FC<SidePanelProps> = ({ gameState, selectedPlot, activeOverlay, onPlayerAction, onSetOverlay, onAskAi, isPaused, gameSpeed, onPauseToggle, onSetSpeed, onSelectPlotById }) => {
    const [cropToPlant, setCropToPlant] = useState<Crop | null>(CROPS[0]);

    const handlePlant = () => {
        if(selectedPlot && cropToPlant && gameState.player.resources >= cropToPlant.cost) {
            onPlayerAction('plant', selectedPlot.id, cropToPlant);
        }
    }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Player Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon="💰" label="Resources" value={`$${gameState.player.resources}`} color="text-yellow-400" />
        <StatCard icon="🌍" label="Eco Score" value={gameState.player.ecoPoints} color="text-green-400" />
      </div>
      
       {/* Smart Field Dashboard */}
      <div>
        <h3 className="text-lg font-bold">Smart Field Data</h3>
        <p className="text-sm text-slate-400 mb-2">Toggle data overlays to analyze your farm.</p>
        <div className="flex flex-wrap gap-2 mt-2">
            <OverlayButton label="None" type="none" active={activeOverlay} onClick={onSetOverlay} />
            <OverlayButton label="Moisture" type="soilMoisture" active={activeOverlay} onClick={onSetOverlay} />
            <OverlayButton label="Temperature" type="temperature" active={activeOverlay} onClick={onSetOverlay} />
            <OverlayButton label="Nutrients" type="nutrientLevel" active={activeOverlay} onClick={onSetOverlay} />
            <OverlayButton label="Vegetation" type="vegetation" active={activeOverlay} onClick={onSetOverlay} />
        </div>
      </div>
      
      {/* Farm Alerts */}
      <div className="bg-slate-900/50 rounded-lg p-3">
        <h3 className="text-lg font-bold text-emerald-300 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2a6 6 0 00-6 6v3.586l-1.707 1.707A1 1 0 003 15h14a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
            Farm Alerts
        </h3>
        {gameState.alerts && gameState.alerts.length > 0 ? (
            <div className="space-y-1.5 mt-2 max-h-32 overflow-y-auto pr-1">
                {gameState.alerts.map(alert => {
                    const style = getAlertStyle(alert.type);
                    return (
                      <div 
                          key={alert.id} 
                          className={`${style.className} p-2 rounded-lg text-sm cursor-pointer transition-colors`}
                          onClick={() => onSelectPlotById(alert.plotId)}
                          title={`Click to select Plot ${alert.plotId + 1}`}
                      >
                          <p className={`font-semibold ${style.titleColor} flex items-center gap-1.5`}><span className="text-base">{style.icon}</span> {style.title}</p>
                          <p className="text-slate-300 text-xs pl-6">{alert.message}</p>
                      </div>
                    )
                })}
            </div>
        ) : (
            <p className="text-slate-400 text-sm mt-2">All systems nominal. No critical alerts.</p>
        )}
      </div>

      {/* Action Panel */}
      <div className="flex-grow bg-slate-900/50 rounded-lg p-3 min-h-[200px]">
        <h3 className="text-lg font-bold mb-2">{selectedPlot ? `Plot ${selectedPlot.id + 1} Actions` : 'Select a Plot'}</h3>
        {selectedPlot ? (
            <div className="space-y-3">
                {/* Plot Info */}
                 <div className="text-xs grid grid-cols-2 gap-1 text-slate-300">
                    <span>Moisture: {(selectedPlot.soilMoisture * 100).toFixed(0)}% {selectedPlot.soilMoisture > 0.95 ? '⚠️' : ''}</span>
                    <span>Temp Index: {(selectedPlot.temperature * 100).toFixed(0)}%</span>
                    <span>Nutrients: {(selectedPlot.nutrientLevel * 100).toFixed(0)}%</span>
                    <span>Health: {selectedPlot.health.toFixed(0)}%</span>
                 </div>
                {/* Actions */}
                {selectedPlot.crop ? (
                    <div>
                        <p className="text-center font-bold">{selectedPlot.crop.name} is growing.</p>
                        <p className="text-center text-sm">({(selectedPlot.growthStage * 100).toFixed(0)}% complete)</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <select onChange={(e) => setCropToPlant(CROPS.find(c => c.id === e.target.value) || null)} className="w-full bg-slate-700 p-2 rounded">
                            {CROPS.map(crop => <option key={crop.id} value={crop.id}>{crop.name} - ${crop.cost}</option>)}
                        </select>
                        <button onClick={handlePlant} disabled={!cropToPlant || gameState.player.resources < cropToPlant.cost} className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded">
                            Plant {cropToPlant?.name}
                        </button>
                    </div>
                )}
                 <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => onPlayerAction('water', selectedPlot.id)} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded">Water</button>
                    <button onClick={() => onPlayerAction('fertilize', selectedPlot.id)} className="w-full bg-yellow-700 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded">Fertilize</button>
                </div>
            </div>
        ) : <p className="text-slate-400">Click a plot on the map to see details and perform actions.</p>}
      </div>

      <div className="flex flex-col gap-2">
        <button onClick={onAskAi} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded transition-colors flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
            Ask AI Advisor
        </button>

        <div className="bg-slate-900/50 rounded-lg p-2">
            <div className="flex items-center justify-between">
                <button 
                    onClick={onPauseToggle} 
                    className="w-16 h-12 flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-bold text-2xl transition-transform transform hover:scale-105"
                    aria-label={isPaused ? 'Play' : 'Pause'}
                >
                    {isPaused ? '▶' : '❚❚'}
                </button>
                <div className="flex gap-2">
                    {[1, 2, 4].map(speed => (
                        <button 
                            key={speed}
                            onClick={() => onSetSpeed(speed)}
                            className={`px-4 py-2 font-bold rounded-md transition-colors w-16 ${gameSpeed === speed ? 'bg-emerald-500 text-white' : 'bg-slate-600 hover:bg-slate-500 text-slate-300'}`}
                        >
                            {speed}x
                        </button>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};