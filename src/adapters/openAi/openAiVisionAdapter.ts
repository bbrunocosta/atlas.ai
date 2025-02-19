import { AiVisionPort, AiVisionRepsonse } from '../../ports/AiVisionPort';
import { AiCompletitionPort } from '../../ports/AiCompletitionsPort';
import { ImageGenerateParams } from 'openai/resources';
import { AiUsagePort } from '../../ports/AiUsagePort';

import OpenAI from 'openai';
import axios from 'axios'


export class OpenAiVisionAdapter implements AiVisionPort {

  constructor(
    private readonly openAi: OpenAI,
    private readonly AiCompletitionPort: AiCompletitionPort,
    private readonly AiUsagePort: AiUsagePort
  ){}

  async generateImage(prompt: string, lang: string): Promise<AiVisionRepsonse>  {
    const options: ImageGenerateParams = {
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024"
    };
    
    const response = await this.openAi.images.generate(options);
    const spent = this.AiUsagePort.calculateCost(response, options)
  
    const url = response.data[0].url
    const imageResponse = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer'
    });
  
    const buffer = Buffer.from(imageResponse.data); 
    const base64Image = `data:image/png;base64,${buffer.toString("base64")}`; 
  
  
    const { amountSpent, caption, fileName } = await this.AiCompletitionPort.generateImageMetadata(base64Image, lang)
  
    return {base64Image, amountSpent: spent + amountSpent, caption, fileName}
  }
}

export default OpenAiVisionAdapter


