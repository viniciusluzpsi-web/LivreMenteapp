
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";

export class GeminiTherapist {
  async analyzeThought(thought: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analise este pensamento automático: "${thought}". Identifique as distorções cognitivas e sugira uma pergunta de reestruturação. Responda apenas com o JSON solicitado.`,
      config: {
        systemInstruction: SYSTEM_PROMPT + " Você deve ser extremamente conciso e clínico. Não use frases longas. Foque em objetividade.",
        temperature: 0.4,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            distortions: {
              type: Type.STRING,
              description: "Nome das distorções encontradas (ex: Catastrofização, Tudo ou nada).",
            },
            reframing: {
              type: Type.STRING,
              description: "Uma pergunta socrática curta para desafiar o pensamento.",
            },
          },
          required: ["distortions", "reframing"],
        },
      },
    });

    try {
      const jsonStr = response.text.trim();
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error("Erro ao processar feedback da IA:", e);
      return null;
    }
  }

  async chat(message: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
      },
    });
    return response.text;
  }
}
