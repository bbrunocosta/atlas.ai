export interface AiVisionPort {
  generateImage(prompt: string, lang: string): Promise<AiVisionRepsonse>
}

export interface AiVisionRepsonse {
  base64Image: string
  amountSpent: number
  caption: string,
  fileName: string
}