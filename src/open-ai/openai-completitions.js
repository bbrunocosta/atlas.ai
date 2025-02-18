import openAi from './openai-client.js'
import usage from './openai-usage.js'
import z from 'zod'
import { zodResponseFormat } from 'openai/helpers/zod';
import generateBalanceResponse from './tools/functions/generateBalanceResponse.js'
import generateImageResponse from './tools/functions/generateImageResponse.js'
import handleMisunderstanding from './tools/functions/handleMisunderstanding.js'
import infoBrunoCosta from './settings/info-bruno-costa.js';
import infoAtlas from './settings/info-atlas.js';
import infoUsage from './settings/info-usage.js';
import infoDateTime from './settings/info-date-time.js';
import infoWhatsapp from './settings/info-whatsapp.js';

export default {
  generateAtlasResponse,
  generateImageMetadata,
  generateTranslation
}


function mapMessage({role, content, image, }) {
  const message = {
    role, 
    content: []
  }

  if(content){
    message.content.push({ 
      type: 'text', 
      text: content 
    })
  }

  if(image) {
    message.content.push({ 
      type: 'image_url', 
      image_url: {  url: image } 
    })
  }

  return message;
}


export async function generateAtlasResponse(chatHistory) {
  
  const imageMetadata = z.object({
    lang: z.string().describe("The language the user wants to speak."),
    response_type: z.enum(['audio', 'text']).describe("Whether the message should be sent in text or audio"),
    message: z.string().describe("The response for the user's last query in text, in the same language as 'lang'."),
  });
  
  
  const options = {
    model: "gpt-4o-mini",
    messages: [
      { role: 'developer', content: infoBrunoCosta },
      { role: 'developer', content: infoAtlas },
      { role: 'developer', content: infoUsage },
      { role: 'developer', content: infoDateTime(chatHistory) },
      { role: 'developer', content: infoWhatsapp},
      { role: 'developer', content: 'Here is your past messages with the user!' },
      ...chatHistory.replied.map(mapMessage),
      { role: 'developer', content: 'The chat starts from here!\n' + 
        chatHistory.isFirstInteraction
        ?'This is your fist message to the user. You sould do a brief introduction of yourself.'
        :''
      },
      ...chatHistory.notReplied.map(mapMessage),
    ],
    response_format: zodResponseFormat(imageMetadata, "response"),
    temperature: 0.5,
    max_tokens: 4000,
    tools: [
      generateBalanceResponse,
      generateImageResponse,
      handleMisunderstanding
    ]
  }

  
  const response = await openAi.chat.completions.create(options);
  console.dir(options.messages, {depth: null})
  console.dir(response, {depth: null})

  const { tool_calls = null, content = null } = response.choices[0].message
  const amountSpent = usage.calculateCost(response, options)
  return {
    tool_calls, 
    content,
    amountSpent,
    tools: options.tools
  }
}


export async function generateImageMetadata(url, lang) {
  const imageMetadata = z.object({
    fileName: z.string(),
    caption: z.string(),
  });

  const options = {
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system", 
        content: [
          { type: "text", text: `You are an excelent metadata creator` },
          { type: "text", text: `Your should respond in ${lang}` }
        ]
      },
      {
        role: "user", 
        content: [ { type: "image_url", image_url: { url, detail: "high" } }
        ]
      }
    ],
    response_format: zodResponseFormat(imageMetadata, "metadata"),
    temperature: 0.7
  }

  const response = await openAi.chat.completions.create(options)
  const {caption, fileName} =  JSON.parse(response.choices[0].message.content)

  const amountSpent = usage.calculateCost(response, options)


  return { amountSpent,  caption, fileName }
}  


async function generateTranslation(text, lang) {
  const options = {
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

  const response = await openAi.chat.completions.create(options)
  const translation =  response.choices[0].message.content
  
  const amountSpent = usage.calculateCost(response, options)

  return { amountSpent, translation }
}