
import React, { useState, useEffect, useCallback } from 'react';
import { GameDashboard } from './components/GameDashboard';
import { GameState, Plot, PlayerAction, Crop, OverlayType, GameStatus, Location } from './types';
import { getInitialGameState, advanceTurn } from './services/gameService';
import { EventModal } from './components/EventModal';
import { AiAdvisorModal } from './components/AiAdvisorModal';
import { TutorialModal } from './components/IntroModal';
import { LOCATIONS } from './constants';
import { Header } from './components/Header';


const MainMenu: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white p-4">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-emerald-400 tracking-wider">EARTHROOTS</h1>
      <p className="text-slate-400 text-2xl mt-2">Cultivate a Sustainable Future.</p>
    </div>
    <div className="mt-12">
      <button
        onClick={onStart}
        className="py-4 px-12 bg-emerald-600 text-white font-bold rounded-lg text-xl hover:bg-emerald-500 transition-transform transform hover:scale-105"
      >
        New Mission
      </button>
    </div>
  </div>
);

const LocationSelection: React.FC<{ onSelect: (location: Location) => void }> = ({ onSelect }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-8">
    <h2 className="text-4xl font-bold text-emerald-300 mb-2">Select Your Farm Location</h2>
    <p className="text-slate-400 mb-8 max-w-2xl text-center">Each region presents unique environmental challenges and advantages. Your strategy will need to adapt to the local climate.</p>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {LOCATIONS.map(loc => (
        <div key={loc.id} className="bg-slate-800 rounded-lg p-6 border-2 border-slate-700 hover:border-emerald-500 transition-all flex flex-col">
          <div className="text-4xl mb-3">{loc.icon}</div>
          <h3 className="text-2xl font-bold text-white">{loc.name}</h3>
          <p className="text-slate-400 mt-2 flex-grow">{loc.description}</p>
          <button
            onClick={() => onSelect(loc)}
            className="mt-6 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded"
          >
            Choose This Location
          </button>
        </div>
      ))}
    </div>
  </div>
);


const App: React.FC = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>('MainMenu');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [activeOverlay, setActiveOverlay] = useState<OverlayType>('none');
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showTutorialModal, setShowTutorialModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [gameSpeed, setGameSpeed] = useState(1);

  const handleStartGame = () => {
    setGameStatus('LocationSelection');
  };

  const handleLocationSelect = (location: Location) => {
    setLoading(true);
    const initialState = getInitialGameState(location);
    setGameState(initialState);
    if (initialState.currentEvent) {
      setShowEventModal(true);
    }
    setGameStatus('InGame');
    setShowTutorialModal(true);
    setLoading(false);
  };
  
  const handlePlotSelect = useCallback((plot: Plot) => {
    setSelectedPlot(plot);
  }, []);

  const tick = useCallback(() => {
    if (!gameState) return;
    
    setGameState(prevState => {
      if (!prevState) return null;
      const newState = advanceTurn(prevState);
       if (newState.currentEvent && newState.currentEvent.turnTriggered === newState.turn) {
          setShowEventModal(true);
          setIsPaused(true); // Auto-pause on new events
       }
      return newState;
    });
    setSelectedPlot(null);

  }, [gameState]);

  useEffect(() => {
    if (isPaused || gameStatus !== 'InGame') {
      return;
    }

    // Base interval is 5 seconds for 1x speed
    const intervalId = setInterval(tick, 5000 / gameSpeed);

    return () => clearInterval(intervalId);
  }, [isPaused, gameSpeed, tick, gameStatus]);


  const handlePlayerAction = useCallback((action: PlayerAction, plotId: number, crop?: Crop) => {
    if (!gameState) return;

    setGameState(prevState => {
      if (!prevState) return null;
      
      const newPlots = prevState.plots.map(p => {
        if (p.id === plotId) {
          switch(action) {
            case 'plant':
              return { ...p, crop: crop || null, health: 100, growthStage: 0 };
            case 'water':
              return { ...p, soilMoisture: Math.min(1, p.soilMoisture + 0.3) };
            case 'fertilize':
              return { ...p, nutrientLevel: Math.min(1, p.nutrientLevel + 0.4) };
            default:
              return p;
          }
        }
        return p;
      });

      const actionCost = { plant: 0, water: 10, fertilize: 25 }[action]; // Plant cost is separate
      const plantCost = action === 'plant' ? crop?.cost || 0 : 0;
      const newEcoPoints = prevState.player.ecoPoints + ({plant: 1, water: 2, fertilize: 1}[action]);

      return {
        ...prevState,
        plots: newPlots,
        player: {
          ...prevState.player,
          resources: prevState.player.resources - actionCost - plantCost,
          ecoPoints: newEcoPoints
        }
      };
    });
  }, [gameState]);


  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
        Establishing satellite link to new location...
      </div>
    );
  }

  if (gameStatus === 'MainMenu') {
    return <MainMenu onStart={handleStartGame} />;
  }

  if (gameStatus === 'LocationSelection') {
    return <LocationSelection onSelect={handleLocationSelect} />;
  }
  
  if (gameStatus === 'InGame' && gameState) {
    return (
      <div className="bg-slate-900 text-slate-100 min-h-screen font-sans">
        {showTutorialModal && <TutorialModal location={gameState.location!} onClose={() => setShowTutorialModal(false)} />}
        <GameDashboard
          gameState={gameState}
          selectedPlot={selectedPlot}
          activeOverlay={activeOverlay}
          onPlotSelect={handlePlotSelect}
          onPlayerAction={handlePlayerAction}
          onSetOverlay={setActiveOverlay}
          onAskAi={() => setShowAiModal(true)}
          isPaused={isPaused}
          gameSpeed={gameSpeed}
          onPauseToggle={() => setIsPaused(p => !p)}
          onSetSpeed={setGameSpeed}
        />
        {showEventModal && gameState.currentEvent && (
          <EventModal
            event={gameState.currentEvent}
            onClose={() => setShowEventModal(false)}
          />
        )}
        {showAiModal && (
          <AiAdvisorModal
            gameState={gameState}
            onClose={() => setShowAiModal(false)}
          />
        )}
      </div>
    );
  }
  
  return null; // Should not be reached
};

export default App;
