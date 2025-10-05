
import React from 'react';
import { GameEvent } from '../types';

interface EventModalProps {
  event: GameEvent;
  onClose: () => void;
}

export const EventModal: React.FC<EventModalProps> = ({ event, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl max-w-lg w-full border-2 border-amber-400">
        <div className="p-6">
          <div className="text-center">
             <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 mb-4">
                <svg className="h-6 w-6 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <h3 className="text-2xl font-bold text-amber-300" id="modal-title">
              {event.title}
            </h3>
            <div className="mt-2">
              <p className="text-slate-300">
                {event.description}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-slate-700/50 px-4 py-3 text-right">
          <button
            type="button"
            className="py-2 px-4 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-500"
            onClick={onClose}
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};
