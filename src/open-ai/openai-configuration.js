import * as dotenv from 'dotenv'
dotenv.config()
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
    organization: process.env.OPEN_AI_ORGANIZATION_ID,
    apiKey: process.env.OPEN_AI_API_KEY
});

export const openAi = new OpenAIApi(configuration);