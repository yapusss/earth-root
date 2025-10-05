
import React, { useState, useCallback } from 'react';
import { GameState } from '../types';
import { getAiAdvice } from '../services/geminiService';

interface AiAdvisorModalProps {
  gameState: GameState;
  onClose: () => void;
}

export const AiAdvisorModal: React.FC<AiAdvisorModalProps> = ({ gameState, onClose }) => {
  const [question, setQuestion] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const predefinedQuestions = [
    "What crop should I plant next?",
    "How can I improve my soil moisture?",
    "What does the current heatwave mean for my farm?",
    "Explain my farm's vegetation data to me."
  ];

  const handleAsk = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setIsLoading(true);
    setResponse('');
    try {
      const advice = await getAiAdvice(gameState, q);
      setResponse(advice);
    } catch (error) {
      setResponse("An error occurred while getting advice. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [gameState]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAsk(question);
  };


  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full border border-indigo-400 flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
          <h3 className="text-xl font-bold text-indigo-300" id="modal-title">
            Ask Ceres, Your AI Advisor
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">&times;</button>
        </div>

        <div className="p-4 flex-grow overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            response ? (
              <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap">
                <p>{response}</p>
              </div>
            ) : (
              <div>
                <p className="text-slate-400 mb-4">What do you need help with? Select a suggestion or type your own question.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {predefinedQuestions.map((q, i) => (
                    <button key={i} onClick={() => { setQuestion(q); handleAsk(q); }} className="text-left p-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-slate-700 flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about your farm, crops, or data..."
            className="flex-grow bg-slate-900 border border-slate-600 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            disabled={isLoading}
          />
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-500" disabled={isLoading || !question.trim()}>
            {isLoading ? 'Thinking...' : 'Ask'}
          </button>
        </form>
      </div>
    </div>
  );
};
