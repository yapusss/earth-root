
import React, { useState } from 'react';
import { Location } from '../types';

interface TutorialModalProps {
  location: Location;
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ location, onClose }) => {
    const [step, setStep] = useState(0);

    const tutorialSteps = [
        {
            title: "Mission Briefing",
            text: "Welcome to the EarthRoots Initiative. I am Ceres, your AI agronomist. We've been assigned to this sector to establish a viable farming operation. The conditions here will be challenging, but our satellite data will give us an edge."
        },
        {
            title: `Location Analysis: ${location.name}`,
            text: `Our sensors indicate this area is a ${location.name.toLowerCase()}. ${location.description} The initial soil readings are moderate, but you'll need to manage them carefully.`
        },
        {
            title: "Your First Task",
            text: "Your goal is to prepare the soil, plant a crop, and nurture it to harvest. First, select a plot on the grid. Analyze its data in the side panel, then use 'Fertilize' and 'Water' to prepare it for planting. Watch your resources!"
        },
        {
            title: "Dynamic Weather",
            text: "Pay close attention to the weather forecast each season. Rain can save you resources, but overwatering a plot during a downpour can damage your crops. Adapt your strategy to the changing conditions. Good luck, Farmer."
        }
    ];

    const currentStep = tutorialSteps[step];
    const isLastStep = step === tutorialSteps.length - 1;

    const handleNext = () => {
        if (isLastStep) {
            onClose();
        } else {
            setStep(s => s + 1);
        }
    }

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full border-2 border-emerald-500/50 animate-fade-in">
        <div className="p-8 space-y-4">
            <div className="flex items-center gap-4">
                <div className="flex-shrink-0 h-20 w-20 rounded-full bg-indigo-900/50 border-2 border-indigo-500/60 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-300" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    <span className="absolute -bottom-2 -right-2 text-3xl">🤖</span>
                </div>
                <div>
                     <h3 className="text-2xl font-bold text-emerald-300" id="modal-title">
                        {currentStep.title}
                    </h3>
                    <p className="text-sm text-indigo-300">Ceres // AI Advisor</p>
                </div>
            </div>
            
            <div className="mt-4 text-slate-300 text-lg prose prose-invert max-w-none">
              <p>{currentStep.text}</p>
            </div>
        </div>
        <div className="bg-slate-800/50 px-6 py-4 text-right">
          <button
            type="button"
            className="py-2 px-6 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-500 transition-transform transform hover:scale-105"
            onClick={handleNext}
          >
            {isLastStep ? 'Begin Mission' : 'Next'}
          </button>
        </div>
      </div>
       <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
          }
        `}</style>
    </div>
  );
};
