export interface AiTranscriptionPort {
  audioIntoText(base64Audio: string): Promise<AiTextResponse>
  textIntoAudio(input: string): Promise<AiAudioResponse> 
}

export interface AiTextResponse {
  text: string
  amountSpent: number
}

export interface AiAudioResponse {
  base64Audio: string
  amountSpent: number
}
