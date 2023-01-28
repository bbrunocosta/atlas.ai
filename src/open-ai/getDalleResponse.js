import { openAi } from './openai-configuration.js'
export const getDalleResponse = async (clientText) => {
    const options = {
        prompt: clientText,
        n: 1,
        size: "1024x1024",
    };

    try {
        const response = await openAi.createImage(options);
        return response.data.data[0].url;
    } catch (e) {
        return `❌ OpenAI Response Error: ${e.response.data.error.message}`;
    }
}