import { upsertCredits } from "../../../data/sqlite-repository"
import openaiTranscriptions from "../../openai-transcriptions.mjs"

export default {
  type: 'function',
  function: {
    name: 'generateAudioResponse',
    description: "Gerar uma resposta em áudio convertendo texto em fala. Use esta função para ler, narrar, falar, criar audio, som, ou sintetizar voz a partir de um texto.",
    parameters: {
        type: "object",
        properties: {
          input: { 
            type: "string", 
            description: "O texto que deve ser transformado em áudio." 
          },
          response_type: {
            type: 'string',
            description: 'Define se a reposta deverá ser falada em audio ou enviada via texto',
            enum: ['audio', 'text']
          },
          lang: { type: "string", description: "O idioma do texto enviado pelo usuário" }
        },
        required: ["input", 'response_type', 'lang']
    },
    async call({ client, message, input, response_type, lang }) {
      await client.startRecording(message.from)
      const {amountSpent, base64Audio} = await openaiTranscriptions.textIntoAudio(input)
      const credits = await upsertCredits(message.from, amountSpent)
      await client.sendBase64AudioPtt(message.from, base64Audio, input )

      if(client.exceedUsage(credits)) {
        await client.sendUsageLimitReachedMessage({
          message, response_type, lang
        })
      }
    }
  }

}


