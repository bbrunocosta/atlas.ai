
export interface AiPort
{
  transcriptions: {
    textIntoAudio(text: string): Promise<{ amountSpent: number, audio: string }>
    audioIntoText(audio:string): Promise<{ amountSpent: number, text: string }>
  },
  vision: {
    generateImage(prompt): Promise<{ amountSpent: number, image: string }>
  },
  completitions: {

  }
}