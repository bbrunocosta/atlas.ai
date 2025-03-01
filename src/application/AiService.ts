// import { getChatHistory, getCredits, upsertCredits } from '../data/sqlite-repository';
import { MessageFactory } from "../domain/entites/messageFactory";
import { MessageRepository } from "../domain/repos/messageRepository";
import { UsageRepository } from "../domain/repos/usageRepository";
import { AiCompletitionPort } from "../ports/AiCompletitionsPort";
import { MessagePort } from "../ports/MessagePort";
import { AiFunctionCallExecutor } from "../domain/ai/functions/AiFunctionCall";
import { StorePort } from "../ports/StorePort";
import { error } from "console";

class AiService {
    constructor(
        private readonly AiCompletitionsPort: AiCompletitionPort,
        private readonly messageRepository: MessageRepository,
        private readonly usageRepository: UsageRepository,
        private readonly messagePort: MessagePort,
        private readonly messageFactory: MessageFactory,
        private readonly storePort: StorePort,
        private readonly AiFunctions: AiFunctionCallExecutor[]
    ){}

    async HandleMessageReceived(chatId: string){
        try{

        const credits = await this.usageRepository.getCredits(chatId)
        const metadata = await this.storePort.getChatMetadata(chatId)
        
        if(credits <= 0) {
            const errorMessage0 = await this.messageFactory.FromCode(chatId, metadata?.response_type ?? 'text', metadata?.lang ?? 'pt', 'usage_limit_reached_0')
            const errorMessage1 = await this.messageFactory.FromCode(chatId, metadata?.response_type ?? 'text', metadata?.lang ?? 'pt', 'usage_limit_reached_1')
            await this.messagePort.sendMessage(errorMessage0)
            await this.messagePort.sendMessage(errorMessage1)
            return;
        }

        const chatHistory = await  this.messageRepository.getChatHistory(chatId)
        const response = await this.AiCompletitionsPort.generateAtlasResponse(chatId, chatHistory)
        await this.usageRepository.upsertCredits(chatId, response.amountSpent)
        
        
        if(response.error){
            const errorMessage = await this.messageFactory.FromCode(chatId, metadata?.response_type ?? 'text', metadata?.lang ?? 'pt', response.error)
            await this.messagePort.sendMessage(errorMessage)
        }

        
        if(response.functions?.length) {
            for(const function_call of response.functions)
            {
                const args = JSON.parse(function_call.arguments)
                await this.storePort.setChatMetadata(chatId, {response_type: args.response_type, lang: args.lang})
                
                const action = this.AiFunctions.find(func => func.name === function_call.name)
                action.execute({...args, chatId: chatId})
            }
        }
            
            
        if(response.message) {
            const {lang, response_type} = response
            await this.storePort.setChatMetadata(chatId, {response_type, lang})

            const responseMessage = await this.messageFactory.FromCompletitionResponse(chatId, response)
            await this.messagePort.sendMessage(responseMessage)
        }
    }
    catch(error) {
        console.error('AiService.HandleMessageReceived', error)
    }

    }
}


export default AiService



