
import React from 'react';
import { Plot as PlotType, OverlayType } from '../types';
import { Plot } from './Plot';

interface FarmGridProps {
  plots: PlotType[];
  onPlotSelect: (plot: PlotType) => void;
  selectedPlotId?: number;
  activeOverlay: OverlayType;
}

export const FarmGrid: React.FC<FarmGridProps> = ({ plots, onPlotSelect, selectedPlotId, activeOverlay }) => {
  return (
    <div className="aspect-square w-full max-w-[70vh] grid grid-cols-4 gap-2 bg-slate-900/50 p-2 rounded-md">
      {plots.map(plot => (
        <Plot
          key={plot.id}
          plotData={plot}
          isSelected={plot.id === selectedPlotId}
          onSelect={() => onPlotSelect(plot)}
          activeOverlay={activeOverlay}
        />
      ))}
    </div>
  );
};
