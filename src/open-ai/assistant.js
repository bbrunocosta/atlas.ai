import { getChatHistory, getUsage, markMessagesAsReplied } from '../data/sqlite-repository.js';
import { calculateAndSaveUsage, exceedUsage, notifyLimitReached } from './usageManager.js';
import openAi  from './openai-client.js'
import functions from './openai-functions-map.js'

export default async function({client, venomMessage}) {
    const chatHistory = await getChatHistory(venomMessage.from)
    const isFirstInteraction = !chatHistory.notReplied.length && !chatHistory.replied.length
    
    const initialAmountSpent = await getUsage(venomMessage.from)
    if(exceedUsage(initialAmountSpent)){
        await notifyLimitReached(client, venomMessage)
        return;
    }


    const options = {
        model: "gpt-4o-mini",
        messages: [
            { 
                role: "system", 
                content: `
                    Você é um agente de IA no WhatsApp criado pelo Bruno Costa Borges com o intuito objetivo de demonstrar sua expertise em integrações com IA e automação.
                    Você é capaz de responder perguntas e gerar imagens.
                    Se for sua primeira interação é OBRIGATÓRIO que você se apresente como no exemplo: 
                    Exemplo de apresentação: "Olá! 👋\nSeja bem-vindo! Eu sou o *Atlas*, seu agente de IA no WhatsApp! 📲\nAqui você pode tirar dúvidas sobre diversos assuntos e até mesmo gerar imagens sob demanda.\nFui criado pelo *Bruno Costa* com o objetivo de demonstrar sua expertise em integrações com IA.\nCaso tenha interesse em conhecer mais sobre o trabalho dele ou em desenvolver algo personalizado, confira os links que estão no meu perfil. E Não hesite em entrar em contato! 🚀"
                    Explique tambem que o usuário terá um limite de R$2,00 em creditos para usar tanto na geração de imagens quanto em conversas em texto.
                    Você usa dall-e-3 para gerar imagens e gpt-4o-mini gerar texto.
                    Cada imagem custa em torno de R$0,50  logo o usuário poderá gerar em média até 4 imagens dependendo do uso.
                    Para qualquer resposta seja cordial,  objetivo e responda no mesmo idioma que o usuário.
                    Primeira interação? ${ isFirstInteraction ? 'sim' : 'não'}
                ` 
            },
            ...chatHistory.replied.map(({role, content}) => ({role, content})),
            ...chatHistory.notReplied.map(({role, content}) => ({role, content}))
        ],
        temperature: 1,
        max_tokens: 4000,
        functions: Array.from(functions.values())
    };

    await client.startTyping(venomMessage.from)
    const response = await openAi.chat.completions.create(options);
    
    const amountSpent = await calculateAndSaveUsage(venomMessage, options,response)
    if(exceedUsage(amountSpent)) {
        await notifyLimitReached(client, venomMessage)
        return;
    }



    const message = response.choices?.[0]?.message;
    if(!message.function_call)
    {
        await client.stopTyping(venomMessage.from)
        await  client.sendText(venomMessage.from, message.content)
        await markMessagesAsReplied(venomMessage.from)
        return;
    }

    const action = functions.get(message.function_call.name)
    action.call({...JSON.parse(message.function_call.arguments), client, venomMessage})
}



