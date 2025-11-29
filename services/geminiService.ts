import { GoogleGenAI, Type } from "@google/genai";
import { DefectSeverity } from "../types";

const apiKey = process.env.API_KEY || '';

// Safely initialize GenAI only if key exists (handled in calls mostly)
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const analyzeDefect = async (
  description: string,
  checkItemName: string
): Promise<{ severity: DefectSeverity; advice: string }> => {
  if (!ai) {
    return {
      severity: DefectSeverity.MINOR,
      advice: "API Key missing. Unable to perform AI analysis.",
    };
  }

  try {
    const prompt = `
      You are a DVSA (Driver and Vehicle Standards Agency) expert for HGV inspections in the UK.
      
      The user has reported a defect during an inspection.
      Item: "${checkItemName}"
      Description: "${description}"

      Please analyze this defect based on the 'Categorisation of Defects' manual.
      1. Determine the severity (Minor, Major, or Dangerous).
      2. Provide a short, professional advice summary (max 20 words) for the driver/mechanic.

      Return JSON.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            severity: {
              type: Type.STRING,
              enum: [DefectSeverity.MINOR, DefectSeverity.MAJOR, DefectSeverity.DANGEROUS]
            },
            advice: {
              type: Type.STRING
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const result = JSON.parse(text);
    
    return {
      severity: result.severity as DefectSeverity,
      advice: result.advice || "Check DVSA manual manually."
    };

  } catch (error) {
    console.error("AI Analysis failed:", error);
    return {
      severity: DefectSeverity.MAJOR, // Default to caution
      advice: "AI analysis unavailable. Treat with caution."
    };
  }
};
