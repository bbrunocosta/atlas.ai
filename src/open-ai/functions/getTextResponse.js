import openAi  from '../openai-client.js'
import functions from '../openai-functions-map.js'

export const getTextResponse = async (message, chatHistory = []) => {
    const prompt = message.body || message.caption || ''
    const options = {
        model: "gpt-4o",
        messages: [
            { role: "system", content: "Você é um assistente capaz de responder perguntas e gerar imagens." },
            ...chatHistory,
            { role: "user", content: prompt }
        ],
        temperature: 1,
        max_tokens: 4000,
        functions: Array.from(functions.values())
    };

    try {
        const response = await openAi.chat.completions.create(options);
        const message = response.choices?.[0]?.message;
        
        if (!message) {
            return {
                responseType: 'text',
                text: "❌ OpenAI Response Error: Nenhuma resposta foi gerada."
            };
        }

        if (message.function_call && functions.has(message.function_call.name)) {
            try {
                const functionArgs = JSON.parse(message.function_call.arguments || '{}');
                return functions.get(message.function_call.name).call(functionArgs.prompt || '');
            } catch (err) {
                console.error("Erro ao processar function_call:", err);
                return {
                    responseType: 'text',
                    text: "❌ Erro ao executar a função solicitada."
                };
            }
        }
        return {
            responseType: 'text',
            text: response.choices.map((choice) => choice.message.content || "").join("\n").trim()
        };

    }
    
    catch (e) {
        console.error(e);
        return {
            responseType: 'text',
            text: `❌ OpenAI Response Error: ${e.response?.data?.error?.message || e.message}`
        };
    }
};
