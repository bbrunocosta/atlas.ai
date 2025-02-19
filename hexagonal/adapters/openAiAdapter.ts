import { AiPort } from "../ports/aiPort";

class OpenAiAdapter implements AiPort
{
  transcriptions: { 
    textIntoAudio(text: string): Promise<{ amountSpent: number; audio: string; }>; 
    audioIntoText(audio: string): Promise<{ amountSpent: number; text: string; }>; 
  };
  vision: { 
    generateImage(prompt: any): Promise<{ amountSpent: number; image: string; }>; 
  };
  completitions: {};
}

export default OpenAiAdapter