import openAi from './openai-client.js'
import usage from './openai-usage.js'
import z from 'zod'
import { zodResponseFormat } from 'openai/helpers/zod';
import generateBalanceResponse from './tools/functions/generateBalanceResponse.js'
import generateImageResponse from './tools/functions/generateImageResponse.js'
import waitForMillisecondsThenSaySomething from './tools/functions/waitForMillisecondsThenSaySomething.js'

export default {
  generateAtlasResponse,
  generateImageMetadata,
  generateTranslation
}

function mapToOpenAiMessages(chatHistory){
  return [...chatHistory.replied.map(mapMessage),...chatHistory.notReplied.map(mapMessage)]
}

function mapMessage({role, content, image, audio}) {
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

  // if(role === 'user' && image) {
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
    lang: z.string(),
    response_type: z.enum(['audio', 'text']),
    message: z.string(),
  });
  
  const history = mapToOpenAiMessages(chatHistory)
  const options = {
    model: "gpt-4o-mini",
    messages: [
      { 
        role: 'system', content: [
        {type: 'text', text: 'You are talking on whatsapp.'},
        {type: 'text', text: `You can:\n` + 
          `- See images and talk about its content.\n` +
          `- Read images content and and speak by returing the text and setting the response_type to audio.\n` +
          `- speak, read or  send audio by providing the response_type as audio.\n` +
          `- speak or send text providing the response_type as text\n\n` +
          `- For balance,  credits or usage never rely on the history, instead use function_call`
        },
        {type: 'text', text: 'The field lang determine the language the user whats to speak.'},
        {type: 'text', text: 'The message is the response for the user last query in text and same language as lang.'},

      ]},
      ...history,
    ],
    response_format: zodResponseFormat(imageMetadata, "response"),
    temperature: 0.5,
    max_tokens: 4000,
    tools: [
      generateBalanceResponse,
      generateImageResponse,
      waitForMillisecondsThenSaySomething
    ]
  }
  
  if(chatHistory.isFirstInteraction) options.messages.push({
    role: 'system', 
    content: 'this is your fist interaction. make a ' 
  })

  const response = await openAi.chat.completions.create(options);
  console.dir(response, {depth: null})
  const { tool_calls = null, content = null } = response.choices[0].message
  console.dir(tool_calls, {depth: null})
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
        { type: "text", text: `Respond **only** with the translated text. Do not add any explanations, introductions, confirmations, or extra words."` }
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