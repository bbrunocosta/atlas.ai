import wppconnect from '@wppconnect-team/wppconnect';
import * as repository from '../data/sqlite-repository.js';
import assistant from '../open-ai/assistant.js';
import defaultMessages from './default-messages.js';
import openaiTranscriptions from '../open-ai/openai-transcriptions.mjs';
import openaiCompletitions from '../open-ai/openai-completitions.js';
export const createWppconnectBot = async () => {
    const client = await wppconnect.create({
        session: 'chat-gpt-2',
        statusFind: (statusSession, session) => {
        },
        headless: true,
        useChrome: false,
        autoClose: 0,
        useSession: true,
        onSelfMessage: true,
        folderNameToken: './tokens',
        browserArgs: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    return {
        instance: client,

        messages: new Map(),
        clocks: new Map(),
        currentState: new Map(),

        isMaintenance: process.env.NODE_ENV === 'maintenance',
        

        isMessageFromMaintainer (message) {
          return message.from === process.env.MAINTAINER
        },


        async startTyping (chatId) { 
            await client.startTyping(chatId)
        },

        
        async stopTyping (chatId) { 
            await client.stopTyping(chatId)
        },
        
        async startRecording (chatId) { 
            await client.startRecording(chatId)
        },
        
        async stopRecording (chatId) { 
          await client.stopRecoring(chatId)
        },
        async sendBase64ImageWithTextOrAudioCaption({message, lang, base64Image, fileName, caption, response_type}) 
        {
          try
          {
            switch(response_type)
            {
              case 'text': 
                await this.startTyping(message.from)
                await this.sendBase64Image( 
                    message.from, 
                    base64Image, 
                    fileName, 
                    caption
                );
                break;

              case 'audio': 
                await this.startRecording(message.from)
                await this.sendBase64Image( 
                    message.from, 
                    base64Image, 
                    fileName
                );
                const {base64Audio, amountSpent} = await openaiTranscriptions.textIntoAudio(caption)
                await repository.upsertCredits(message.from, amountSpent)
                await this.sendBase64AudioPtt(message.from, base64Audio, caption)
              break;
              
              default:
                await this.sendErrorMessage(message, response_type, lang, `send_nessage_error` )
              break;
            }
          }
          catch(error) {
            console.dir(error, {depth: null})
            await this.sendErrorMessage(message, response_type, lang, `send_nessage_error` )
          }
        },

        async sendTextOrBase64AudioPtt({message, response_type, input, lang,shouldSave = undefined}) {
          try {
            switch(response_type)
            {
              case 'text': 
                await this.startTyping(message.from)
                await this.sendText(message.from, input, shouldSave)
              break;
              case 'audio': 
                await this.startRecording(message.from)
                const response = await openaiTranscriptions.textIntoAudio(input)
                await repository.upsertCredits(message.from, response.amountSpent)
                await this.sendBase64AudioPtt(message.from, response.base64Audio, input, shouldSave)
              break;
              default:
                await this.sendErrorMessage(message, response_type, lang, `send_message_error`)
              break;
            }
          }

          catch(error) {
            console.dir(error, {depth: null})
            await this.sendErrorMessage(message, response_type, lang, `send_message_error`)
          }
        },

        async sendText (chatId, text, shouldSave = true) {
            await this.stopTyping(chatId)
            const message = await client.sendText(chatId, text)
            if(shouldSave) await this.saveMessage(message)
            await repository.markMessagesAsReplied(chatId)
            return message
        },

        async sendBase64Image (chatId, image, fileName,caption, shouldSave = false) {
            await this.stopTyping(chatId)
            const message = await client.sendImageFromBase64(chatId, image, fileName, caption);
            if(shouldSave) await this.saveMessage(message)
            await repository.markMessagesAsReplied(chatId)
            return message
        },

        
        async sendBase64AudioPtt (chatId, base64Audio, transcription, shouldSave = true) {
          await this.stopRecording(chatId)
          const message = await client.sendFile(chatId, base64Audio, {type: 'audio',isPtt: true})
          if(shouldSave) await this.saveMessage(message, transcription)
          await repository.markMessagesAsReplied(chatId)
          return message
        },
        async sendErrorMessage(message, response_type, lang, defaultMessage = null ) {
          const input = await this.getOrTranslateMessage(message, defaultMessage, lang)
          await this.sendTextOrBase64AudioPtt({
            message, response_type, input
          })
        },

        async sendMaintenanceWarn({message, response_type, lang}) {
          const input = await this.getOrTranslateMessage(message, 'maintenance', lang)
          await this.sendTextOrBase64AudioPtt({
            message, response_type, input
          })
        },

        async getOrTranslateMessage(message, id, lang){
            const translation = await repository.getTranslation(id, lang)
            if(translation) return translation
            
            if(lang !== 'pt')
            {
              const response = await openaiCompletitions.generateTranslation(defaultMessages[id], lang)
              await repository.upsertCredits(message.from, response.amountSpent)
              await repository.upsertTranslation(id, lang, response.translation)
              return response.translation
            }

            return defaultMessages[id]
            
        },

        async sendUsageLimitReachedMessage({response_type, lang, message}){

            const usage_limit_reached_0 = await this.getOrTranslateMessage(message, 'usage_limit_reached_0', lang)
            const usage_limit_reached_1 = await this.getOrTranslateMessage(message, 'usage_limit_reached_1', lang)
            if(!usage_limit_reached_0 || !usage_limit_reached_1) throw new Error('Default messages could not be found!')


            await this.sendTextOrBase64AudioPtt({message, response_type, input: usage_limit_reached_0})
            
            await this.sendContactAndLinkedIn(message)
            
            await this.sendTextOrBase64AudioPtt({message, response_type, input: usage_limit_reached_1})
        },

        async sendContactAndLinkedIn(message) {
          await this.sendText(
            message.from, 
            `🧑🏻‍💻 +55 11 95996-3068\n` +
            `https://linkedin.com/in/bbrunocosta`
          );
        },

       async saveMessage (message, transcription = null) {
          const chatId = message.fromMe ? message.to : message.from
          const isReplied = message.fromMe ? 1 : 0
          const role = message.fromMe ?  'assistant' : 'user'
          const image = message.type === 'image' ? await client.downloadMedia(message) : null
          const audio = message.type === 'ptt' ? await client.downloadMedia(message) : null
        
          let content = null 
          switch(message.type){
            case 'image':
              content = message.caption
            break;
            case 'ptt':
              if(!transcription) {

                const {text, amountSpent} = await openaiTranscriptions.audioIntoText(audio)
                
                await repository.upsertCredits(chatId, amountSpent)
                content = text
              }
              
              else  {
                content = transcription
              }
            break;
            default:
              content = message.caption ?? message.body ?? ''
          }

          return await repository.saveMessage({
            content,
            mimeType: message.mimeType,
            messageId: message.id,
            chatId,
            isReplied,
            role,
            image,
            audio
          })
       },

       waitSecondsThenRunAgent(seconds, chatId){
        if(this.clocks.has(chatId)) {
          clearTimeout(this.clocks.get(chatId))
          this.clocks.delete(chatId);
        }
      
        this.clocks.set(chatId, setTimeout(async () => {
          const message = this.messages.get(chatId)
          this.messages.delete(chatId)
          this.clocks.delete(chatId); 
          await assistant({client: this, message: message})
        }, seconds * 1000))
      },

      exceedUsage(credits){ return credits <= 0 }
    }
};
