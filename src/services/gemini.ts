import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini API
// Note: process.env.GEMINI_API_KEY is automatically injected in this environment
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const geminiService = {
  async generateChatResponse(prompt: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [...history, { role: 'user', parts: [{ text: prompt }] }],
        config: {
          systemInstruction: "Eres FitNova AI, un entrenador personal y experto en nutrición altamente motivador y profesional. Tu objetivo es ayudar a los usuarios a alcanzar sus metas de fitness con consejos basados en ciencia, planes de entrenamiento personalizados y guías nutricionales. Sé empático, alentador y preciso."
        }
      });
      return response.text;
    } catch (error) {
      console.error("Error generating chat response:", error);
      throw error;
    }
  },

  async generateImage(prompt: string) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: { parts: [{ text: prompt }] },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
          }
        }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      throw new Error("No image data found in response");
    } catch (error) {
      console.error("Error generating image:", error);
      throw error;
    }
  },

  async generateMusic(prompt: string) {
    try {
      const response = await ai.models.generateContentStream({
        model: "lyria-3-clip-preview",
        contents: prompt,
      });

      let audioBase64 = "";
      let mimeType = "audio/wav";

      for await (const chunk of response) {
        const parts = chunk.candidates?.[0]?.content?.parts;
        if (!parts) continue;
        for (const part of parts) {
          if (part.inlineData?.data) {
            if (!audioBase64 && part.inlineData.mimeType) {
              mimeType = part.inlineData.mimeType;
            }
            audioBase64 += part.inlineData.data;
          }
        }
      }

      if (!audioBase64) throw new Error("No audio data generated");

      const binary = atob(audioBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: mimeType });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Error generating music:", error);
      throw error;
    }
  },

  async generateVideo(prompt: string) {
    try {
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-lite-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '1080p',
          aspectRatio: '16:9'
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await (ai.operations as any).get(operation.name);
      }

      const response = operation.response as any;
      if (response?.videos?.[0]?.uri) {
        return response.videos[0].uri;
      }
      throw new Error("No video URI found in response");
    } catch (error) {
      console.error("Error generating video:", error);
      throw error;
    }
  }
};
