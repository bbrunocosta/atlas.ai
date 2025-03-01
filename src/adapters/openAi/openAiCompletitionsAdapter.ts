import { AiCompletitionPort, AiCompletitionResponse, AiImageMetadataResponse, AiTranslationResponse } from '../../ports/AiCompletitionsPort';
import { ChatCompletionCreateParamsNonStreaming, ChatCompletionMessageToolCall, ChatCompletionTool } from 'openai/resources/chat/completions';
import { zodResponseFormat } from 'openai/helpers/zod';
import { AiUsagePort } from '../../ports/AiUsagePort';

import infoBrunoCosta from '../../domain/ai/context/brunoCostaContext';
import infoDateTime from '../../domain/ai/context/dateAndTimeContext';
import infoUsage from '../../domain/ai/context/infoAndUsageContext';
import infoWhatsapp from '../../domain/ai/context/whatsappContext';
import infoAtlas from '../../domain/ai/context/atlasContext';
import Message from '../../domain/entites/message';
import OpenAI from 'openai';

import * as z from 'zod'
import { AiFunctionCallDescription } from '../../domain/ai/functions/AiFunctionCall';

class OpenAiCompletitionsAdapter implements AiCompletitionPort {

  constructor(
    private readonly AiClient: OpenAI,
    private readonly AiUsagePort: AiUsagePort,
    private readonly functions: AiFunctionCallDescription[]
  ){}

  async generateAtlasResponse(chatId: string, chatHistory: {replied: Message[], notReplied: Message[]}): Promise<AiCompletitionResponse> {
    const maxAttempts = 3
    for(let attempt = 1; attempt <= maxAttempts; attempt++)
    {
      console.log(attempt, 'Calling generateAtlasResponse...')
      try {  
        const response_format = z.object({
          lang: z.string().describe("The language the user wants to speak."),
          response_type: z.enum(['audio', 'text']).describe("Whether the message should be sent in text or audio"),
          message: z.string().describe("The response for the user's last query in text, in the same language as 'lang'."),
        });
        
        const options: ChatCompletionCreateParamsNonStreaming = {
          tool_choice: chatHistory.replied.length ? 'auto': 'none',
          parallel_tool_calls: false,
          model: "gpt-4o-mini",
          messages: [
            { role: 'developer', content: infoBrunoCosta },
            { role: 'developer', content: infoAtlas },
            { role: 'developer', content: infoUsage },
            { role: 'developer', content: infoDateTime(chatId) },
            { role: 'developer', content: infoWhatsapp },
            { role: 'developer', content: 'escreva respostas curtas com no máximo 2 paragrafos'},
          ],
          response_format: zodResponseFormat(response_format, "response"),
          temperature: 0,
          tools: [
            ...this.functions.map(func => ({
              type: 'function',
              function: func
            }) as unknown as  ChatCompletionTool)
          ]
        }
  
        if(chatHistory.replied.length){
          options.messages.push({ 
            role: 'developer', 
            content: 'Here is your past messages with the user!' 
          }, ...chatHistory.replied.map(this.mapMessage)) 
        }
  
        options.messages.push({
          role: 'developer',
          content: chatHistory.replied.length
          ?'The chat starts from here!\n'
          :'The chat starts from here!\nThis is your fist message to the user. You sould do a brief introduction of yourself.'
        }, ...chatHistory.notReplied.map(this.mapMessage))
      
        
        const response = await this.AiClient.chat.completions.create(options);
        // console.dir(options.messages, {depth: null})
        // console.dir(response, {depth: null})
        const amountSpent = this.AiUsagePort.calculateCost(response, options)
        const finish_reason = response.choices[0].finish_reason
        console.log('finish_reason: ', finish_reason)
        if(finish_reason  === 'length') {
          console.dir(response)
          if(maxAttempts === attempt){
            return {
              message: null,
              lang: null,
              response_type: null,
              functions: null, 
              amountSpent,
              error: 'generate_text_error'
            }
          }
          else continue;
        }
        
        const { tool_calls = null, content = null } = response.choices[0].message
        const functions = tool_calls?.filter(tool => tool.type == 'function').map(this.mapToDomainFunction) ?? []
  
        return {
          ... content ? JSON.parse(content): {},
          functions, 
          amountSpent,
        }
      }
      catch(error) {
        console.error('OpenAiCompletitionsAdapter.generateAtlasResponse.error', error)

        return {
          error: null,
          response_type: 'text',
          lang: 'pt',
          message: 'Houve um erro ao processar sua solicitação. Tente novamente mais tarde.',
          functions: null,
          amountSpent: 0
        }
      }
    }
  }

  private mapToDomainFunction(func: ChatCompletionMessageToolCall){
    return  {
      name: func.function.name,
      arguments: func.function.arguments
    }
  }


  async generateImageMetadata(url: string, lang: string): Promise<AiImageMetadataResponse> {
    const imageMetadata = z.object({
      fileName: z.string(),
      caption: z.string(),
    });
  
    const options: ChatCompletionCreateParamsNonStreaming = {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "developer", 
          content: [
            { type: "text", text: `You are an excelent metadata creator` },
            { type: "text", text: `Your should respond in ${lang}` }
          ]
        },
        {
          role: "user", 
          content: [ { type: "image_url", image_url: { url, detail: "high" } }]
        }
      ],
      response_format: zodResponseFormat(imageMetadata, "metadata"),
      temperature: 0.7
    }
  
    const response = await this.AiClient.chat.completions.create(options)
    const {caption, fileName} =  JSON.parse(response.choices[0].message.content)
  
    const amountSpent = this.AiUsagePort.calculateCost(response, options)
  
  
    return { amountSpent,  caption, fileName }
  }  


  async generateTranslation(text: string, lang: string): Promise<AiTranslationResponse> {
    const options: ChatCompletionCreateParamsNonStreaming = {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: [
          { type: "text", text: `You are an excelent Translator` },
          { type: "text", text: `Respond *only* with the translated text. Do not add any explanations, introductions, confirmations, or extra words."` }
        ] },
        { 
          role: "user", 
          content: [
            { type: "text", text: `Translate the following text to ${lang}:` },
            { type: "text", text }
          ]
        }
      ],
      temperature: 0.5,
      max_tokens: 4000,
    }
  
    const response = await this.AiClient.chat.completions.create(options)
    const translation =  response.choices[0].message.content
    
    const amountSpent = this.AiUsagePort.calculateCost(response, options)
  
    return { amountSpent, translation }
  }


  private mapMessage({role, text, image, caption, url}: Message) {
    const message = {
      role, 
      content: []
    }
  
    if(text){
      message.content.push({ 
        type: 'text', 
        text 
      })
    }
  
    if(image && role != 'assistant') {
      message.content.push({ 
        type: 'image_url', 
        image_url: {  url: url || image } 
      })
    }

    if(image && role === 'assistant' && caption) {
      message.content.push({ 
        type: 'text', 
        text: caption
      })
    }
  
    return message;
  }
}


export default OpenAiCompletitionsAdapter









