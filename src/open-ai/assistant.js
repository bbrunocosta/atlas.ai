import { getChatHistory, getCredits, upsertCredits } from '../data/sqlite-repository.js';
import openaiCompletitions from './openai-completitions.js';

export default async function({client, message}) {

    if(client.exceedUsage(await getCredits(message.from))) {
        await client.sendUsageLimitReachedMessage({
            message, lang: 'pt', response_type: 'text'
        })
        return;
    }
    
    const chatHistory = await getChatHistory(message.from)

    const {content, amountSpent, tool_calls, tools} = await openaiCompletitions.generateAtlasResponse(chatHistory)
    const credits = await upsertCredits(message.from, amountSpent)


    if(content)
    {

        const { response_type, lang, ... rest } = JSON.parse(content)

        await client.sendTextOrBase64AudioPtt({
            message, response_type, lang, input: rest.message 
        })

        if(client.exceedUsage(credits)){
            await client.sendUsageLimitReachedMessage({
                message, response_type, lang
            })
            return;
        }
        return;
    }

    if(tool_calls) {
        for(const function_call of tool_calls)
        {
            if(function_call.type === 'function') {
                const action = tools.find(func => func.function.name === function_call.function.name)
                action.function.call({client, message, ...JSON.parse(function_call.function.arguments)})
            }
        }
    }
}



