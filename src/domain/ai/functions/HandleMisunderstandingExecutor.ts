import { MessageFactory } from "../../entites/messageFactory";
import { AiFunctionCallExecutor, AiFunctionCallResponse } from "./AiFunctionCall";
import { MessagePort } from "../../../ports/MessagePort";
import { MessageRepository } from "../../repos/messageRepository";


export class HandleMisunderstandingExecutor implements AiFunctionCallExecutor {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly messagePort: MessagePort,
    private readonly messageFactory: MessageFactory,
  ){}
  
  readonly name = 'handleMisunderstanding'

  async execute (args: AiFunctionCallResponse): Promise<void> {
    const message = await this.messageFactory.FromText(args.chatId, args.response_type, args.message)
    await this.messagePort.sendMessage(message)
  }
}


export default HandleMisunderstandingExecutor