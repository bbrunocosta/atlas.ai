import axios from 'axios'
import openAi  from '../openai-client.js'
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

export const getImageResponse = async (prompt) => {    
    const options = {
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024"
    };

    try {
        const response = await openAi.images.generate(options);
        // Retorna a URL da imagem gerada

        const imageResponse = await axios({
            url: response.data[0].url,
            method: 'GET',
            responseType: 'arraybuffer' // 🚀 Stream para evitar salvar no disco
        });


        // 🔥 Converte `arraybuffer` para `Buffer` antes de transformar para Base64
        const buffer = Buffer.from(imageResponse.data); 
        const base64Image = `data:image/png;base64,${buffer.toString("base64")}`; 



        const imageMetadata = z.object({
            fileName: z.string(),
            caption: z.string(),
        });
        
        
        const metadataResponse = await openAi.chat.completions.create({
            model: "gpt-4o-mini", // Modelo mais econômico que suporta JSON
            messages: [
                {
                    role: "system", content: [
                        { type: "text", text: `O usuário solicitou a criação de uma imagem com o seguinte a seguir:` },
                        { type: "text", text: `prompt: "${prompt}"` },
                        { type: "text", text: ` Você é responsável por analisar a imagem gerada e gerar metadata!` },
                        { type: "text", text: `Voce deve responder no mesmo idioma do prompt!` }
                    ]
                },
                {
                  role: "user", content: [
                    {
                        type: "image_url",
                        image_url: {
                            "url": response.data[0].url,
                            "detail": "high"
                        },
                    }
                  ]
                }
            ],
            response_format: zodResponseFormat(imageMetadata, "metadata"),
            temperature: 0.7
        });

        const {fileName, caption} = JSON.parse(metadataResponse.choices[0].message.content)


        return {
            responseType: 'img',
            fileName,
            data: base64Image,
            text: caption
        } 
    } catch (e) {
        console.error(e);
        return {
            responseType: 'text',
            text: `❌ Erro ao gerar imagem: ${e.response?.data?.error?.message || e.message}`
        };
    }
};

