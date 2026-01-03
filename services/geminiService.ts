
import { GoogleGenAI, Type } from "@google/genai";
import { ResumeData } from "../types";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
};

export const improveText = async (text: string, context: string): Promise<string> => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Improve the following professional text for a resume. Make it more impactful, concise, and focused on accomplishments. 
      Context: ${context}
      Text to improve: "${text}"`,
    });
    return response.text?.trim() || text;
  } catch (error) {
    console.error("Error improving text:", error);
    return text;
  }
};

export const generateSummary = async (profileData: string): Promise<string> => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Based on the following resume details, write a compelling 2-3 sentence professional summary for a CV.
      Details: ${profileData}`,
    });
    return response.text?.trim() || "";
  } catch (error) {
    console.error("Error generating summary:", error);
    return "";
  }
};

export const suggestSkills = async (experiences: string): Promise<string[]> => {
    const ai = getAIClient();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Given these professional experiences: ${experiences}. Suggest a list of 5-8 highly relevant professional skills (keywords only, comma separated).`,
      });
      const text = response.text || "";
      return text.split(',').map(s => s.trim()).filter(s => s.length > 0);
    } catch (error) {
      console.error("Error suggesting skills:", error);
      return [];
    }
  };

export const parseLinkedInText = async (rawText: string): Promise<Partial<ResumeData>> => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an expert resume parser. Extract information from this LinkedIn profile text and format it exactly according to the provided schema. 
      Input text: "${rawText}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            personal: {
              type: Type.OBJECT,
              properties: {
                fullName: { type: Type.STRING },
                email: { type: Type.STRING },
                phone: { type: Type.STRING },
                location: { type: Type.STRING },
                website: { type: Type.STRING },
                summary: { type: Type.STRING },
              },
            },
            experiences: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  company: { type: Type.STRING },
                  position: { type: Type.STRING },
                  startDate: { type: Type.STRING, description: "YYYY-MM format" },
                  endDate: { type: Type.STRING, description: "YYYY-MM format or 'Present'" },
                  description: { type: Type.STRING },
                  current: { type: Type.BOOLEAN },
                },
              },
            },
            education: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  institution: { type: Type.STRING },
                  degree: { type: Type.STRING },
                  field: { type: Type.STRING },
                  gradDate: { type: Type.STRING, description: "YYYY-MM format" },
                },
              },
            },
            skills: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  level: { type: Type.STRING, enum: ["Beginner", "Intermediate", "Expert"] },
                },
              },
            },
          },
        },
      },
    });

    const jsonStr = response.text?.trim();
    if (!jsonStr) throw new Error("No response from AI");
    
    const parsed = JSON.parse(jsonStr);
    
    // Add IDs to the arrays
    if (parsed.experiences) parsed.experiences = parsed.experiences.map((e: any) => ({ ...e, id: Math.random().toString(36).substr(2, 9) }));
    if (parsed.education) parsed.education = parsed.education.map((e: any) => ({ ...e, id: Math.random().toString(36).substr(2, 9) }));
    if (parsed.skills) parsed.skills = parsed.skills.map((s: any) => ({ ...s, id: Math.random().toString(36).substr(2, 9) }));
    
    return parsed;
  } catch (error) {
    console.error("Error parsing LinkedIn text:", error);
    throw error;
  }
};
