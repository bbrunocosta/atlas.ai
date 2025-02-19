import * as dotenv from 'dotenv'
dotenv.config()

export default  {
  credentials: {
    organization: process.env.OPEN_AI_ORGANIZATION_ID,
    apiKey: process.env.OPEN_AI_API_KEY
  },
  pricing_rules: {
    "gpt-4o-mini": [
      {
        "type": "prompt_tokens",
        "unitAmount": 1000000,
        "price": 0.15
      },
      {
        "type": "completion_tokens",
        "unitAmount": 1000000,
        "price": 0.6
      },
      {
        "type": "cached-tokens",
        "unitAmount": 1000000,
        "price": 0.075
      }
    ],
    "dall-e-3": [
      {
        "type": "image",
        "unitAmount": 1,
        "price": 0.04
      }
    ],
    "whisper-1": [
      {
        "type": "audio",
        "unitAmount": 1,
        "price": 0.006
      }
    ],
    "tts-1": [
      {
        "type": "audio",
        "unitAmount": 1,
        "price": 0.006
      }
    ]
  }
}