import ffmpeg from 'fluent-ffmpeg';
import openAi  from './openai-client.js'
import { PassThrough } from 'stream';
import usage from './openai-usage.js';
export default {
  textIntoAudio,
  audioIntoText
}

export async function audioIntoText(audio) {

  const buffer = Buffer.from(audio.split(',')[1], "base64")
  
  const options = { 
    model: "whisper-1",  
    file: new File([buffer], 'audio.ogg', {type: 'audio/ogg'})
  }
  
  const response = await openAi.audio.transcriptions.create(options)
  const amountSpent = usage.calculateCost(response, options)

  return {
    text: response.text,
    amountSpent
  }
}


export async function textIntoAudio(input) {
  const options = {
    model: "tts-1",
    voice: "onyx",
    input,
    response_format: 'opus'
  }
  const response = await openAi.audio.speech.create(options);
  const base64Audio = await makeAudioProcessing(response.body)

  const amountSpent = usage.calculateCost(response, options)

  return {
    amountSpent,
    base64Audio,
  }
}


function makeAudioProcessing(inputStream) {
  return new Promise((resolve, reject) => {
    try {
      const chunks = []
      const outputStream = new PassThrough()
      outputStream.on('data', (chunk) => chunks.push(chunk))
      outputStream.on('end', () => {
        const buffer = Buffer.concat(chunks)
        const base64String = buffer.toString("base64")
        const base64Audio = `data:audio/ogg;codecs=opus;base64,${base64String}`;
        resolve(base64Audio)
      })
    
    
      ffmpeg(inputStream)
      .inputFormat("ogg")
      .toFormat("ogg")
      .audioCodec("libopus")
      .audioChannels(1)
      .audioFrequency(48000)
      .audioFilters([
        `atempo=1`,
        `silenceremove=stop_periods=-1:stop_duration=0.7:stop_threshold=-50dB`
      ])
      .pipe(outputStream)

    } catch(error){
      reject(error)
    }
  })
}



