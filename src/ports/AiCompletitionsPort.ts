import Message from "../domain/entites/message"

export interface AiCompletitionPort {
  generateAtlasResponse(chatId: string, chatHistory: {replied: Message[], notReplied: Message[]}): Promise<AiCompletitionResponse>
  generateImageMetadata(url: string, lang: string): Promise<AiImageMetadataResponse>
  generateTranslation(text: string, lang: string): Promise<AiTranslationResponse>
}

export interface AiCompletitionResponse {
  amountSpent: number
  functions: {
    name: string,
    arguments: string
  }[]
  lang: string
  response_type: 'text' | 'audio'
  message: string
}

export interface AiImageMetadataResponse { 
  amountSpent: number
  caption: string
  fileName:string
}


export interface AiTranslationResponse { 
  amountSpent: number, 
  translation: string 
}