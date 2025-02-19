import { AiFunctionCallResponse, AiFunctionCallExecutor } from "./AiFunctionCall";
import { MessageRepository } from "../../repos/messageRepository";
import { UsageRepository } from "../../repos/usageRepository";
import { MessageFactory } from "../../entites/messageFactory";
import { MessagePort } from "../../../ports/MessagePort";



export class GenerateBalanceResponseExecutor implements AiFunctionCallExecutor {

  constructor(
    private readonly usageRepository: UsageRepository,
    private readonly messageRepository: MessageRepository,
    private readonly messagePort: MessagePort,
    private readonly messageFactory: MessageFactory
  ){}
  
  readonly name = 'generateBalanceResponse'

  async execute (args: AiFunctionCallResponse): Promise<void> {
    try {

      const balance = await this.usageRepository.getCredits(args.chatId)
      const balanceMessage: string = args.message.replace(/\d+/g, `${balance}`)
      const message =  await this.messageFactory.FromText( args.chatId,  args.response_type, balanceMessage )
      await this.messagePort.sendMessage(message)
    } 

    catch(error) {
      console.error('GenerateBalanceResponseExecutor.execute', error)
    }
  }
}

export default GenerateBalanceResponseExecutor