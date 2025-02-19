import { boolean } from 'zod'
import { AiPort } from '../../ports/aiPort'
import { MessageRepository } from '../repos/messageRepository'
import { UsageRepository } from '../repos/usageRepository'
import Message from './message'
export class MessageFactory
{

  constructor(
    private readonly AiPort: AiPort,
    private readonly messageRepository: MessageRepository,
    private readonly usageRepository: UsageRepository
  ){}

  async create( 
    id: string,
    chatId: string,
    role: 'assistant' | 'user',
    text: string, 
    
    lang?: string,
    response_type?: 'text' | 'audio',
    
    audio?: string,
    audioCaption?: string,
    
    image?: string,
    fileName?: string,
    caption?: string,

    shouldSave?: boolean,
    isReplied?: boolean,
    mimeType?: string,
    timestamp?: number
  ) {


    if(response_type === 'audio' && !audio){
      audio = await this.getAudioFromText(chatId, text)

      if(caption) {
        audioCaption = await this.getAudioFromText(chatId, caption)
      }
    }


    const message = new Message( 
      id,
      chatId,
      role,
      text,
      
      lang,
      response_type,
      
      audio,
      audioCaption,
      
      image,
      fileName,
      caption,
  
      shouldSave,
      
      isReplied,
      mimeType,
  
      timestamp
    )


    if(shouldSave){
      await this.messageRepository.saveMessage(message)
    }

    return message
  }

  private async getAudioFromText(chatId: string, text: string) {
    const result = await this.AiPort.transcriptions.textIntoAudio(text)
    await this.usageRepository.upsertCredits(chatId, result.amountSpent)
    return result.audio
  }
}