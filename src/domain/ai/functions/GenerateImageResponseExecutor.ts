// import * as repository from "";
import { UsageRepository } from "../../repos/usageRepository";
import { MessageFactory } from "../../entites/messageFactory";
import { AiVisionPort } from "../../../ports/AiVisionPort";
import { AiFunctionCallExecutor, AiFunctionCallResponse } from "./AiFunctionCall";
import { MessagePort } from "../../../ports/MessagePort";
import { MessageRepository } from "../../repos/messageRepository";

export class GenerateImageResponseExecutor implements AiFunctionCallExecutor {

  constructor( 
    private readonly messagePort: MessagePort,
    private readonly messageFactory: MessageFactory,
    private readonly AiVisionPort: AiVisionPort,
    private readonly usageRepository: UsageRepository
  ){}
  
  readonly name = 'generateImageResponse'

  async execute ({chatId, prompt, message, response_type, lang }: AiFunctionCallResponse): Promise<void> {    
    try {
      const textMessage = await this.messageFactory.FromText( chatId, response_type, message )
      await this.messagePort.sendMessage(textMessage)
      
      const {base64Image, caption, fileName, amountSpent} = await this.AiVisionPort.generateImage(prompt, lang)
      await this.usageRepository.upsertCredits(chatId, amountSpent)

      const imageMessage = await this.messageFactory.FromImage( chatId, response_type, base64Image, fileName, caption)
      await this.messagePort.sendMessage(imageMessage)
    }
    
    catch(error) {
      console.error('GenerateImageResponseExecutor.execute', error)
    }
  }
}

export default GenerateImageResponseExecutor


