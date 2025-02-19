import { AiFunctionCallDescription } from "./AiFunctionCall";

export default {
  name: "generateImageResponse",
  description: "",
  parameters: {
    type: "object",
    properties: {
      prompt: { type: "string", description: "The complete prompt user sent to you" },
      message: { type: "string", description: "A message requireing in firt-person asking user to wait until you finishs the image generation" },
      response_type: {
        type: 'string',
        description: 'Defines if the input shuld be sent sent as text or audio',
        enum: ['audio', 'text']
      },
      lang: { type: "string", description: "The language you are talking with the user by now" }
    },
    required: ["prompt", "message", "response_type", "lang" ]
  }
} as AiFunctionCallDescription


