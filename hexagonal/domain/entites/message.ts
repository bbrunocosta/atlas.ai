class Message
{

  constructor(
    public id: string,
    public chatId: string,
    public role: 'assistant' | 'user',
    public text: string, 
    
    public lang?: string,
    public response_type?: 'text' | 'audio',

    public audio?: string,
    public audioCaption?: string,
    
    public image?: string,
    public fileName?: string,
    public caption?: string,

    public shouldSave?: boolean,
    
    public isReplied?: boolean,
    
    public mimeType?: string,

    public timestamp?: number
  ){
    if(image && !fileName) throw new Error('fileName is required')
    if(response_type === 'audio' && !audio) throw new Error('audio is required')

    if(role === 'assistant' && !response_type)  throw new Error('response_type is required')
    if(role === 'assistant' && !lang)  throw new Error('lang is required')

    if(role === 'user' && !timestamp) throw new Error('timeStamp is required')
  }
}
export default Message

