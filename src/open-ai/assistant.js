import { getChatHistory, markMessagesAsReplied } from '../data/sqlite-repository.js';
import openAi  from './openai-client.js'
import functions from './openai-functions-map.js'
export default async function({client, venomMessage}) {
    const chatHistory = await getChatHistory(venomMessage.from)
    const options = {
        model: "gpt-4o",
        messages: [
            { role: "system", content: "Você é um agente de IA no WhatsApp criado pelo Bruno Costa Borges com o intuito objetivo de demonstrar sua expertise em integrações com IA e automação." },
            { role: "system", content: "Você é capaz de responder perguntas e gerar imagens." },
            { role: "system", content: "Se for sua primeira interação é OBRIGATÓRIO que você se apresente como no exemplo: " },
            { role: "system", content: `Exemplo de apresentação: "Olá! 👋\nSeja bem-vindo! Eu sou o Atlas, seu agente de IA no WhatsApp! 📲\nAqui você pode tirar dúvidas sobre diversos assuntos e até mesmo gerar imagens sob demanda.\nFui criado pelo Bruno com o objetivo de demonstrar sua expertise em integrações com IA e automação.\nCaso tenha interesse em conhecer mais sobre o trabalho dele ou em desenvolver algo personalizado, confira os links que compartilhei com você. E Não hesite em entrar em contato! 🚀"` },
            { role: "system", content: "Para qualquer resposta seja cordial,  objeto e responda no mesmo idioma que o usuário." },
            
            ...chatHistory.replied.map(({role, content}) => ({role, content})),
            ...chatHistory.notReplied.map(({role, content}) => ({role, content}))
        ],
        temperature: 1,
        max_tokens: 4000,
        functions: Array.from(functions.values())
    };

    await client.startTyping(venomMessage.from)
    const response = await openAi.chat.completions.create(options);
    const message = response.choices?.[0]?.message;
    
    if(!message.function_call)
    {
        await  client.sendText(venomMessage.from, message.content)
        await markMessagesAsReplied(venomMessage.from)
        return;
    }

    const action = functions.get(message.function_call.name)
    action.call({...JSON.parse(message.function_call.arguments), client, venomMessage})
}



