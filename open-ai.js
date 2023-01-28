
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
    organization: process.env.OPEN_AI_ORGANIZATION_ID,
    apiKey: process.env.OPEN_AI_API_KEY
});

const openai = new OpenAIApi(configuration);


export const getDavinciResponse = async (clientText) => {
    const options = {
        model: "text-davinci-003",
        prompt: clientText,
        temperature: 1,
        max_tokens: 4000
    };

    try {
        const response = await openai.createCompletion(options);
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


export const getDalleResponse = async (clientText) => {
    const options = {
        prompt: clientText,
        n: 1,
        size: "1024x1024",
    };

    try {
        const response = await openai.createImage(options);
        return response.data.data[0].url;
    } catch (e) {
        return `❌ OpenAI Response Error: ${e.response.data.error.message}`;
    }
}