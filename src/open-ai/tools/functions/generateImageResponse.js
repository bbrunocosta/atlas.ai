import * as repository from "../../../data/sqlite-repository.js";
import openaiVision from "../../openai-vision.js";

export default {
  type:'function',
  function: {
    name: "generateImageResponse",
    description: "",
    parameters: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "The complete prompt user sent to you" },
        input: { type: "string", description: "A message requireing in firt-person asking user to wait until you finishs the image generation" },
        response_type: {
          type: 'string',
          description: 'Defines if the input shuld be sent sent as text or audio',
          enum: ['audio', 'text']
        },
        lang: { type: "string", description: "The language you are talking with the user by now" }
      },
      required: ["prompt", "input", "response_type", "lang" ]
    },
    async call ({prompt, client, message, input, response_type, lang }) {    
      try {

        await client.sendTextOrBase64AudioPtt({
          message, response_type, input, lang 
        })

        const {base64Image, caption, fileName, amountSpent} = await openaiVision.generateImage(prompt, lang)
        const credits = await repository.upsertCredits(message.from, amountSpent)
        await client.sendBase64ImageWithTextOrAudioCaption({
          message, response_type, base64Image, fileName, caption, lang
        })

        if(client.exceedUsage(credits)) {
          await client.sendUsageLimitReachedMessage({
            message, response_type, lang
          })
        }
      }
      
      catch(error) {
        console.dir(error, {depth: null})
        await client.sendErrorMessage(message, response_type, lang, 'generate_image_error')
      }
    }
  }
}


