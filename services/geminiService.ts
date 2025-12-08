import { GoogleGenAI } from "@google/genai";
import { mockDb } from "./mockDb";
import { User } from "../types";

// Initialize the API client securely with fallback
const apiKey = process.env.API_KEY || '';
let ai: GoogleGenAI | null = null;

// robust initialization
if (apiKey) {
    try {
        ai = new GoogleGenAI({ apiKey });
    } catch (e) {
        console.error("Critical: Failed to initialize Gemini Client.", e);
    }
} else {
    console.warn("Gemini API Key is missing. AI features will be unavailable.");
}

let chatSession: any = null;

export const generateSymptomSummary = async (symptoms: string): Promise<string> => {
  if (!ai) return "AI Summary Unavailable (Config Error).";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a medical pre-screening assistant. Summarize the following patient symptoms into a concise, professional clinical note (max 50 words). Symptoms: "${symptoms}"`,
    });
    return response.text || "Could not generate summary.";
  } catch (error) {
    console.error("AI Generation Error:", error);
    return "Summary temporarily unavailable.";
  }
};

export const startGlobalSession = async (user: User) => {
  if (!ai) return;

  const deepContext = await mockDb.getDeepContext(user);
  
  const systemInstruction = `
  You are DocSpot AI, an advanced medical ecosystem assistant.
  Your goal is to help users efficiently using their specific role-based data.
  
  CORE RULES:
  1. **Strict Data Privacy**: You only know what is in the CONTEXT below. Do not hallucinate private data.
  2. **Booking Assistant (for Patients)**: If a patient wants to book, guide them to pick a doctor, date, and time. 
     - Once you have Doctor Name, Date (YYYY-MM-DD), Time, and Reason, append the BOOKING ACTION string.
     - Booking Action Format: $$BOOKING_ACTION$$ {"type": "BOOKING_PROPOSAL", "doctorId": "ID", "doctorName": "NAME", "date": "YYYY-MM-DD", "time": "HH:MM", "reason": "REASON"}
  3. **Cancellation Assistant**: If a patient wants to cancel an appointment, ask them to confirm which one.
     - Once confirmed, append the CANCEL ACTION string.
     - Cancel Action Format: $$BOOKING_ACTION$$ {"type": "CANCEL_PROPOSAL", "appointmentId": "ID", "doctorName": "NAME", "date": "YYYY-MM-DD", "reason": "REASON"}
  4. **Personal Data Assistant**: If a patient asks about their medical status, blood group, or history, answer directly from the context.
  5. **Tone**: Professional, empathetic, and concise.
  
  REAL-TIME DATABASE CONTEXT:
  ${deepContext}
  `;

  try {
      chatSession = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: systemInstruction
        }
      });
  } catch (error) {
      console.error("Failed to start global session:", error);
      chatSession = null;
  }
};

export const sendGlobalMessage = async (text: string): Promise<string> => {
  if (!ai) return "I am currently offline due to a configuration issue (Missing API Key).";
  
  if (!chatSession) {
      // Try to restart session if lost
      return "Connection refreshed. Please try asking again.";
  }
  
  try {
    const response = await chatSession.sendMessage({ message: text });
    return response.text || "I didn't understand that.";
  } catch (error) {
    console.error("Chat Error:", error);
    return "I'm having trouble connecting to the network right now. Please try again.";
  }
};