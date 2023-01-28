import { openAi } from './openai-configuration.js'

export const getDavinciResponse = async (clientText) => {
    const options = {
        model: "text-davinci-003",
        prompt: clientText,
        temperature: 1,
        max_tokens: 4000
    };

    try {
        const response = await openAi.createCompletion(options);
        let botResponse = "";
        response.data.choices.forEach(({ text }) => {
            botResponse += text
        });
        return `Chat GPT 🤖\n\n ${botResponse.trim()}`;
    } catch (e) {
        console.log(e);
        return `❌ OpenAI Response Error: ${e.response.data.error.message}`;
    }
}