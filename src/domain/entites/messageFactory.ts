import { AiCompletitionResponse } from '../../ports/AiCompletitionsPort'
import { AiTranscriptionPort } from '../../ports/AiTranscriptionPort'
import { MessageRepository } from '../repos/messageRepository'
import { UsageRepository } from '../repos/usageRepository'
import Message from './message'
import DefaultMessages from '../errors/errorMessages'

export class MessageFactory
{

  constructor(
    private readonly aiTranscriptionPort: AiTranscriptionPort,
    private readonly messageRepository: MessageRepository,
    private readonly usageRepository: UsageRepository,
    private readonly defaultMessages: DefaultMessages
  ){}


  async FromImage(chatId: string, response_type: 'text'| 'audio', image: string, fileName: string, caption?: string )
  {
    try {
      const message = new Message()
      message.withImage(image, fileName, caption)
      message.withchatId(chatId).withRole('assistant')
      
      
      if(response_type === 'audio') {

        const audio = await this.transcriptTextIntoAudio(message.chatId, message.caption)
        message.withAudioCaption(audio)
      }
      
      return message
    }
    catch(error) {
      console.error('MessageFactory.FromImage', error)
    }
  }

  async FromText(chatId: string, response_type: 'text'| 'audio', text: string )
  {
    try {
      const message = new Message()
      message.withchatId(chatId).withRole('assistant').withText(text)
      
      if(response_type === 'audio') {
        const audio = await this.transcriptTextIntoAudio(message.chatId, message.text)
        message.withAudio(audio)
      }
      
      return message
    }
    catch(error) {
      console.error('MessageFactory.FromText', error)
    }
  }

  async FromCode(chatId: string, response_type: 'text'| 'audio', lang: string,  defaultMessageCode: keyof DefaultMessages): Promise<Message>{
    try {
      const message = new Message()
      message.withchatId(chatId).withRole('assistant')
      
      let translatedText = await this.messageRepository.getTranslation(defaultMessageCode, lang)
      
      if(translatedText) message.withText(translatedText)
        else {  
        const text = this.defaultMessages[defaultMessageCode]
        if(!text) throw new Error(`DefaultMessage.${defaultMessageCode} is required`)
        await this.messageRepository.upsertTranslation(defaultMessageCode, lang, text)
        message.withText(text)
      }
      
      if(response_type === 'audio') {
        const audio = await this.transcriptTextIntoAudio(message.chatId, message.text)
        message.withAudio(audio)
      }
      
      return message

    }
    catch(error) {
      console.error('MessageFactory.FromCode', error)
    }
  }

  async FromCompletitionResponse(chatId: string, completitionResponse: AiCompletitionResponse): Promise<Message> {
    try {
      const message = new Message()
      message.withchatId(chatId).withRole('assistant').withText(completitionResponse.message)

      if(completitionResponse.response_type == 'audio') {
        const audio = await this.transcriptTextIntoAudio(message.chatId, message.text)
        message.withAudio(audio)
      }
      
      return message

    }
    catch(error) {
      console.error('MessageFactory.FromImage', error)
    }
  }

  async FromUser(id: string, chatId: string,  text: string | null, audio: string | null, image: string | null, caption: string |  null, timestamp: number): Promise<Message>{
    try {

      const message = new Message()
      message
        .withId(id)
        .withchatId(chatId)
        .withTimestamp(timestamp)
        .withRole('user')
  
      if(text) message.withText(text)
      if(audio) {
        const text = await this.transcriptAudioIntoText(chatId, audio)
        message.withAudio(audio).withText(text)
      }
      if(image) message.withImage(image, caption)
  
      return message
    }

    catch(error) {
      console.error('MessageFactory.FromUser', error)
    }
  }

  private async transcriptAudioIntoText(chatId: string, audio: string) {
    const result = await this.aiTranscriptionPort.audioIntoText(audio)
    await this.usageRepository.upsertCredits(chatId, result.amountSpent)
    return result.text
  }

  private async transcriptTextIntoAudio(chatId: string, text: string) {
    const result = await this.aiTranscriptionPort.textIntoAudio(text)
    await this.usageRepository.upsertCredits(chatId, result.amountSpent)
    return result.base64Audio
  }
}