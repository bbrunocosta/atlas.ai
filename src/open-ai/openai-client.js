import OpenAI from 'openai';
import * as dotenv from 'dotenv'
dotenv.config()

const configuration = {
    organization: process.env.OPEN_AI_ORGANIZATION_ID,
    apiKey: process.env.OPEN_AI_API_KEY
};

export default new OpenAI(configuration);
