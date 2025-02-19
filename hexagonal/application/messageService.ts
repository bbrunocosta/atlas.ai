import Message from "../domain/entites/message";
import { MessagePort } from "../ports/MessagePort";
import errorMessages from '../domain/errors/errorMessages'

class MessageService
{
  constructor(
    private readonly messagePort: MessagePort
  ){}
  
  async sendMessage(message: Message){
    try {
      switch(message.response_type)
      {
        case 'text': 
          await this.messagePort.stopTyping(message.chatId)
          if(message.image) await this.messagePort.sendImageWithCaption(message)
          else await this.messagePort.sendText(message)
        break;
        case 'audio': 
          await this.messagePort.startRecording(message.chatId)
          await this.messagePort.sendAudio(message)
          if(message.image) await this.messagePort.sendImage(message)
          await this.messagePort.sendAudioCaption(message)
        break;
        
        default: throw new Error('invalid_reponse_type' + message.response_type)
      }
    }

    catch(error) {
      console.dir(error, {depth: null})
      console.dir(message, {depth: null})
      await this.sendErrorMessage(message, `send_message_error`)
    }
    
    finally{
      this.messagePort.stopPresence(message.chatId)
    }
  }
  
  async sendErrorMessage(message: Message, errorId: keyof typeof errorMessages){ 

  }

}

export default MessageService