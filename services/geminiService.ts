
import { GoogleGenAI } from "@google/genai";
import { GameState } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. AI Advisor will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const model = "gemini-2.5-flash";

export const getAiAdvice = async (gameState: GameState, question: string): Promise<string> => {
  if (!API_KEY) {
    return "The AI Advisor is currently offline. Please ensure the API_KEY is configured.";
  }

  const systemInstruction = `You are a world-class agronomist and data scientist specializing in remote sensing for agriculture. 
Your name is 'Ceres'. You are advising a farmer in a simulation game called 'EarthRoots'. 
Your advice should be practical, educational, and based ONLY on the data provided. 
Explain complex concepts like 'soil moisture' or 'heat tolerance' simply. 
Keep your answers concise and focused on the user's question. Be encouraging and helpful.`;

  const gameStateSummary = `
    Location: ${gameState.location?.name}
    Current Season: ${gameState.turn}
    Current Weather: ${gameState.weather.type} (${gameState.weather.description})
    Eco Points: ${gameState.player.ecoPoints}
    Resources: $${gameState.player.resources}
    Active Anomaly/Event: ${gameState.currentEvent?.title || 'None'}
    Farm Data Overview:
    - Average Soil Moisture: ${(gameState.plots.reduce((acc, p) => acc + p.soilMoisture, 0) / gameState.plots.length * 100).toFixed(0)}%
    - Average Temperature Index: ${(gameState.plots.reduce((acc, p) => acc + p.temperature, 0) / gameState.plots.length * 100).toFixed(0)}%
    - Average Nutrient Level: ${(gameState.plots.reduce((acc, p) => acc + p.nutrientLevel, 0) / gameState.plots.length * 100).toFixed(0)}%
    `;

  const prompt = `
    Here is the current farm data:
    ${gameStateSummary}

    The farmer's question is: "${question}"

    Please provide your expert advice.
    `;
    
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.5,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching AI advice:", error);
    return "I'm sorry, I'm having trouble analyzing the data right now. Please try again later.";
  }
};
