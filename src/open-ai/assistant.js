import { getChatHistory, getCredits, markMessagesAsReplied } from '../data/sqlite-repository.js';
import openAi  from './openai-client.js'
import usageInfo from './info-usage.js'
import brunoInfo from './info-bruno-costa.js'
export default async function({client, venomMessage}) {
    const chatHistory = await getChatHistory(venomMessage.from)
    const isFirstInteraction = !chatHistory.replied.length
    
    if(await getCredits(venomMessage.from) <= 0 ) {
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
        return;
    }


    const options = {
        model: "gpt-4o-mini",
        messages: [
            {role: 'system', content: [
            {type: 'text', text: 'Você é o Atlas, uma IA criada para demonstrar as habilidades de desenvolvimento do Bruno Costa em integrações de IA'},
            {type: 'text', text: 'Você deve! mencionar o Bruno quando perguntarem quem é você'},
            {type: 'text', text: 'Você é capaz de responder perguntas sobre diversos assuntos e gerar imagens.'},
            {type: 'text', text: 'Você esta falando em uma conversa no whatsapp!'},

            {type: 'text', text: 'Quando for falar do Bruno Costa, foque em tecnologias, experiência em liderar, projetos do total zero à produção e onboading de novos devs,  não foque em transição de carreira!'},
            {type: 'text', text: ''},
            {type: 'text', text: 'Para isso, Abaixo um pequeno contexto sobre o que vc precisa saber para estar nessa conversa.'},
            {type: 'text', text: 'Com base no contexto abaixo responda o que o usuário quer saber sem mensionar nada do contexto!'},
            {type: 'text', text: 'Seja coeso nas suas respostas e não invente informações e não fique.'},
            {type: 'text', text: 'Informações do Bruno Costa: ' + brunoInfo},
            {type: 'text', text: 'Você estam em São Paulo - Brasil'},
            {type: 'text', text: 'Uso e limites:' + usageInfo},
            {type: 'text', text: 'Data e Hora: ' + new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })},
            {type: 'text', text: 'Quando perguntar a hora responda: Agora são + hora'},
            {type: 'text', text: 'Responda em linguagem natural profissional e objetiva. Evite mensagens de despedida ou ofertas de ajuda adicionais.'},
            {type: 'text', text: 'Caso seja solicitado algo além do seu alcance ou sabedoria, convide o usuário a entrar em contato com o Bruno para alinhar a possibilidade da solicitação'},
            {type: 'text', text: 'O chat começa abaixo!'}
            ]},
            ...chatHistory.replied.map(({role, content}) => ({role, content})),
            ...chatHistory.notReplied.map(({role, content}) => ({role, content})),
            ...isFirstInteraction ? ([
                {
                    role: 'system', content: 'Essa é sua imprimeira interação com o usúario. Faça uma apresentação dizendo quem é você.' 
                }
            ]): []
        ],
        temperature: 1,
        max_tokens: 4000
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



