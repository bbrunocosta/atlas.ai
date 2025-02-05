import axios from 'axios'
import openAi  from '../openai-client.js'
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";


export const getImageResponse = async ({client, venomMessage, userRequest, message }) => {    

    try {   

        await client.startTyping(venomMessage.from)
        await client.sendText(venomMessage.from, message)
        const options = {
            model: "dall-e-3",
            prompt: userRequest,
            n: 1,
            size: "1024x1024"
        };

        const response = await openAi.images.generate(options);
        
        
        await client.startTyping(venomMessage.from)
        const imageResponse = await axios({
            url: response.data[0].url,
            method: 'GET',
            responseType: 'arraybuffer'
        });

        const buffer = Buffer.from(imageResponse.data); 
        const base64Image = `data:image/png;base64,${buffer.toString("base64")}`; 


        const imageMetadata = z.object({
            fileName: z.string(),
            caption: z.string(),
        });

        await client.startTyping(venomMessage.from)
        const metadataResponse = await openAi.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system", content: [
                        { type: "text", text: `O usuário solicitou a criação de uma imagem` },
                        { type: "text", text: `Você é responsável por analisar a imagem gerada e gerar metadata!` },
                        { type: "text", text: `Voce deve responder no mesmo idioma do userRequest!` }
                    ]
                },
                {
                  role: "user", content: [
                    {
                        type: "text", text: `userRequest: ${userRequest}`
                    },
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

        await client.startTyping(venomMessage.from)
        await client.sendImageFromBase64(
            venomMessage.from,
            base64Image,
            fileName,
            caption
        );
    } catch (e) {
        await client.sendText(venomMessage.from, `❌ Erro ao gerar imagem: ${e.response?.data?.error?.message || e.message}`)
        console.error(e);
    }
};


