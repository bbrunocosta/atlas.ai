import axios from 'axios'
import openAi  from '../open-ai/openai-client.js'
import completitions from './openai-completitions.js'
import usage from './openai-usage.js';

export default {
  generateImage
}

export async function generateImage(prompt, lang)  {
  const options = {
    model: "dall-e-3",
    prompt,
    n: 1,
    size: "1024x1024"
  };
  
  const response = await openAi.images.generate(options);
  const spent = usage.calculateCost(response, options)

  const url = response.data[0].url
  const imageResponse = await axios({
    url,
    method: 'GET',
    responseType: 'arraybuffer'
  });

  const buffer = Buffer.from(imageResponse.data); 
  const base64Image = `data:image/png;base64,${buffer.toString("base64")}`; 


  const { amountSpent, caption, fileName } = await completitions.generateImageMetadata(base64Image, lang)

  return {base64Image, amountSpent: spent + amountSpent, caption, fileName}
}



