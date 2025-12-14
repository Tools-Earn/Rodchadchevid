import { GoogleGenAI } from "@google/genai";
import { PromptOptions } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateInfographicPrompt = async (options: PromptOptions): Promise<string> => {
  const { topic, style, ratio, layoutPreference, verbosity, tone, specificContent } = options;

  // Intelligent System Instruction: Handles both simple topics and long articles
  const systemInstruction = `
    You are an expert AI Education Designer & Prompt Engineer.
    
    TASK OVERVIEW:
    The user will provide input which can be either a **Short Topic** or a **Long Article/Text**.
    Your goal is to create a detailed Image Generation Prompt (in Thai) for an Infographic.

    PHASE 1: CONTENT ANALYSIS & SUMMARIZATION
    1. Analyze the user's input "${topic}".
    2. **IF the input is LONG (e.g., an article, a news snippet, a paragraph > 150 chars):**
       - You MUST summarize it into a "Knowledge Card" structure.
       - Extract the Title.
       - Extract 3-5 Key Bullet Points (concise, high impact).
       - Extract 1 Conclusion or Stat.
       - Use THIS summary as the core content for the infographic.
    3. **IF the input is SHORT (e.g., "Coffee history", "How to save money"):**
       - You must brainstorm plausible, high-quality educational content relevant to that topic yourself.

    PHASE 2: PROMPT CREATION
    Create a detailed image generation prompt **IN THAI LANGUAGE**.
    
    GUIDELINES:
    1. **Language**: The entire output prompt must be in **Thai**.
    2. **Explicit Content**: explicitly ask for "Infographic displaying Thai text" or "อินโฟกราฟิกที่มีข้อความภาษาไทย".
    3. **Content Structure**:
       - Specify exactly what text should appear on the image (based on Phase 1).
       - Title: "[Title from Analysis]"
       - Bullet Points: "[Point 1]", "[Point 2]", ...
    4. **Target Audience & Complexity**:
       - Level: ${verbosity} (Concise = Elementary, Standard = High School, Detailed = University).
       - Adjust vocabulary and visual complexity accordingly.
    
    5. **Visual Style**:
       - Style: ${style}
       - Tone: ${tone}
       - Layout: ${layoutPreference}
    
    6. **Specific Instructions**:
       ${specificContent ? `- User Note: "${specificContent}" (You MUST integrate this)` : ''}

    OUTPUT FORMAT:
    Return ONLY the Thai prompt text. Do not return the summary separately. 
    The prompt should read like a description for an artist:
    "อินโฟกราฟิกเรื่อง [Title] ในสไตล์ [Style]... ประกอบด้วยหัวข้อหลักดังนี้ 1. [Point 1]... 2. [Point 2]... การจัดวางแบบ [Layout] โทนสี [Tone]..."
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Create the Thai prompt based on this input: "${topic}"`,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7, 
      }
    });

    return response.text || "ไม่สามารถสร้าง Prompt ได้";
  } catch (error) {
    console.error("Error generating prompt:", error);
    throw error;
  }
};

export const generatePreviewImage = async (prompt: string, aspectRatio: string): Promise<string | null> => {
  
  let ratioParam = '1:1';
  if (aspectRatio.includes('9:16')) ratioParam = '9:16';
  else if (aspectRatio.includes('16:9')) ratioParam = '16:9';
  else if (aspectRatio.includes('1:1')) ratioParam = '1:1';

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
            aspectRatio: ratioParam as any, 
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating image preview:", error);
    return null;
  }
};

export const transcribeAudio = async (audioBase64: string, mimeType: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: audioBase64,
              mimeType: mimeType
            }
          },
          {
            text: "Please transcribe this audio. Return ONLY the transcribed text without any additional commentary. If the audio is in Thai, transcribe it in Thai."
          }
        ]
      }
    });

    return response.text || "";
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw error;
  }
};