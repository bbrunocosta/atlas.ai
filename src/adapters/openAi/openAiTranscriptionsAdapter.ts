import { AiAudioResponse, AiTextResponse, AiTranscriptionPort } from '../../ports/AiTranscriptionPort';
import { SpeechCreateParams } from 'openai/resources/audio/speech';
import { AiUsagePort } from '../../ports/AiUsagePort';
import { PassThrough } from 'stream';

import  ffmpeg from 'fluent-ffmpeg';

import OpenAI from 'openai';


class OpenAiTranscriptionsAdapter implements AiTranscriptionPort{

  constructor(
    private readonly openAi: OpenAI,
    private readonly AiUsagePort: AiUsagePort
  ){}

  async audioIntoText(base64Audio: string): Promise<AiTextResponse> {

    const buffer = Buffer.from(base64Audio.split(',')[1], "base64")
    
    const options = { 
      model: "whisper-1", 
      file: new File([buffer], 'audio.ogg', {type: 'audio/ogg'})
    }
    
    const response = await this.openAi.audio.transcriptions.create(options)
    const amountSpent = this.AiUsagePort.calculateCost(response, options)

    return {
      text: response.text,
      amountSpent
    }
  }


  async textIntoAudio(input: string): Promise<AiAudioResponse> {
    const options: SpeechCreateParams = {
      model: "tts-1",
      input,
      response_format: "opus",
      voice: 'onyx'
    }
    
    const response = await this.openAi.audio.speech.create(options);
    const base64Audio = await this.makeAudioProcessing(response.body as unknown as PassThrough)

    const amountSpent = this.AiUsagePort.calculateCost(response, options)

    return {
      amountSpent,
      base64Audio,
    }
  }


  private makeAudioProcessing(inputStream: PassThrough): Promise<string> {
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
}

export default OpenAiTranscriptionsAdapter