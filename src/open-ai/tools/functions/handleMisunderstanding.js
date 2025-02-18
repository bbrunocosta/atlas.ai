export default {
  type: 'function',
  function: {
    name: "handleMisunderstanding",
    description: "Says to the user that you don't understand'.",
    parameters: {
      type: "object",
      properties: {
        input: { "type": "string", "description": "A mensagem que você deseja enviar." },
        response_type: {
          type: 'string',
          description: 'Define se a reposta deverá ser falada em audio ou enviada via texto',
          enum: ['audio', 'text']
        },
        lang: { type: "string", description: "O idioma do texto enviado pelo usuário" }
      },
      required: ["input", "response_type", "lang"]
    },

    async call ({client, message, input, response_type, lang}) {
      client.startTyping(message.from)
      await client.sendTextOrBase64AudioPtt({
        message, response_type, input, lang
      })
    }
  }
}
