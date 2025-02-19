class Message
{
    public id: string
    public chatId: string
    public role: 'assistant' | 'user'
    public text: string

    public audio?: string
    public audioCaption?: string
    
    public image?: string
    public fileName?: string
    public caption?: string
    
    public isReplied?: boolean
    
    public mimeType?: string

    public timestamp?: number

    public lang?: string

    withchatId(chatId: string) {
      this.chatId = chatId
      return this
    }

    withId(id: string) {
      this.id = id
      return this
    }

    withText(text: string){
      this.text = text
      return this
    }
    withTimestamp(timestamp: number) {    
      if(!timestamp) throw new Error('timeStamp is required')
      this.timestamp = timestamp
      return this
    }
    withRole(role: 'user' | 'assistant') {    
      this.isReplied = role === 'assistant'
      this.role = role
      return this
    }

    withAudio(audio: string) {
      if(!audio) throw new Error('audio is required')
      this.audio = audio
      return this
    }

    withAudioCaption(audioCaption: string) {
      if(!audioCaption) throw new Error('audio is required')
      this.audioCaption = audioCaption
      return this
    }

    withImage(image: string, fileName: string, caption?: string) {
      if(image && !fileName) throw new Error('fileName is required')
      this.mimeType = ''
      this.image = image
      this.fileName = fileName
      this.caption = caption
      return this
    }
}

export default Message

