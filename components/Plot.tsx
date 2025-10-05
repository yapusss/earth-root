import React from 'react';
import { Plot as PlotType, OverlayType } from '../types';

interface PlotProps {
  plotData: PlotType;
  isSelected: boolean;
  onSelect: () => void;
  activeOverlay: OverlayType;
}

const getOverlayColor = (plotData: PlotType, activeOverlay: OverlayType): string => {
  const valueMap = {
    soilMoisture: plotData.soilMoisture,
    temperature: plotData.temperature,
    nutrientLevel: plotData.nutrientLevel,
    vegetation: plotData.crop ? plotData.growthStage : 0,
    none: -1
  };
  
  const value = valueMap[activeOverlay];
  if (value === -1) return 'bg-transparent';
  
  const colors = {
    soilMoisture: ['bg-yellow-800/70', 'bg-sky-800/70', 'bg-sky-600/70', 'bg-sky-400/70', 'bg-blue-400/70', 'bg-indigo-600/80'], // Dry to Waterlogged
    temperature: ['bg-sky-500/70', 'bg-green-500/70', 'bg-yellow-500/70', 'bg-orange-600/70', 'bg-red-700/70'], // Cold to Hot
    nutrientLevel: ['bg-stone-500/70', 'bg-lime-800/70', 'bg-lime-600/70', 'bg-lime-400/70', 'bg-green-400/70'], // Low to High
    vegetation: ['bg-transparent', 'bg-emerald-900/70', 'bg-emerald-700/70', 'bg-emerald-500/70', 'bg-emerald-300/70'], // No crop to mature
  };
  
  const palette = colors[activeOverlay];
  let index;
  if(activeOverlay === 'soilMoisture' && value > 0.95) {
      index = palette.length - 1; // Special color for waterlogged
  } else {
      index = Math.min(Math.floor(value * (palette.length -1)), palette.length - 2);
  }
  return palette[index];
};


export const Plot: React.FC<PlotProps> = ({ plotData, isSelected, onSelect, activeOverlay }) => {
  const baseBg = 'bg-yellow-900/50';
  const selectionRing = isSelected ? 'ring-4 ring-emerald-400' : 'ring-2 ring-slate-700';
  const overlayBg = getOverlayColor(plotData, activeOverlay);

  const growthPercentage = plotData.crop ? `${plotData.growthStage * 100}%` : '0%';
  const growthBarColor = plotData.growthStage >= 0.75 ? 'bg-yellow-400' : 'bg-green-400';

  return (
    <div
      onClick={onSelect}
      className={`relative aspect-square rounded-md ${selectionRing} transition-all duration-200 cursor-pointer flex flex-col items-center justify-center p-1 overflow-hidden group`}
    >
      <div className={`absolute inset-0 ${baseBg}`}></div>
      <div className={`absolute inset-0 ${overlayBg} transition-colors duration-300`}></div>
      
      {plotData.crop && (
        <div className="relative z-10 text-center">
          <span className="text-4xl md:text-5xl" style={{ filter: `grayscale(${100 - plotData.health}%)` }}>{plotData.crop.icon}</span>
          <div className="absolute -bottom-2 w-full left-0 px-1">
             <div className="h-1.5 bg-slate-600 rounded-full overflow-hidden">
                <div className={`${growthBarColor} h-full transition-colors duration-500`} style={{ width: growthPercentage }}></div>
             </div>
          </div>
        </div>
      )}

      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <span className="text-white font-bold text-lg">Plot {plotData.id + 1}</span>
      </div>
    </div>
  );
};