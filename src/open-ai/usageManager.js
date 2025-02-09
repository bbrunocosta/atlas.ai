import { addUsage } from "../data/sqlite-repository.js"

export function exceedUsage(amountSpent) {
  return amountSpent >= 1
}

export async function notifyLimitReached(client, venomMessage){
  await client.stopTyping(venomMessage.from)
  
  
  await client.sendText(venomMessage.from, `😲 Ops! Parece que você atingiu o meu limite de uso... 

Eu adoraria continuar essa conversa, mas, por enquanto, não posso mais interagir. Mas olha, se gostou do que viu por aqui, que tal entrar em contato com o Bruno 📩🥹🙏🏼? 
Ele me criou e está pronto para novos desafios.
`)
  await client.sendText(
    venomMessage.from,
    `🧑🏻‍💻 +55 11 95996-3068\nhttps://linkedin.com/in/bbrunocosta`
  );


  await client.sendText(venomMessage.from, `Deixei o LinkedIn e o telefone dele para vocês se falarem, ok?!☎️ \n\nObrigado, foi incrível conversar com você! 🚀🤖`)
}

export async function calculateAndSaveUsage(message, options, responsee)
{
  if(options.model === 'dall-e-3'){
    const price =  0.04 * 6
    const amountSpent = options.n * price
    return await addUsage(message.from, amountSpent)
  }

  if(options.model === 'gpt-4o-mini'){
    const price = {
      input: 0.15/1000000 * 6,
      cached: 0.075/1000000 * 6,
      output: 0.6/1000000 * 6
    }

    const {completion_tokens, prompt_tokens_details: { cached_tokens }, prompt_tokens} = responsee.usage

    const non_cached_tokens = prompt_tokens - cached_tokens
    const usage = price.output * completion_tokens + price.cached * cached_tokens + price.input * non_cached_tokens
    return await addUsage(message.from, usage)
  }
}
