import openAi from './src/open-ai/openai-client.js'

const response = await openAi.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [
    {role: 'user', content: "Hoje é dia 21"},
    // {role: 'developer', content: "Hoje é dia 31"},

    {role: 'user', content: "Que dia é hoje ?"}
  ]
})