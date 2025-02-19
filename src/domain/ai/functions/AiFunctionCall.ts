export interface AiFunctionCallDescription
{
  name: string
  description: string
  parameters: any
}

export interface AiFunctionCallExecutor
{
  name: string,
  execute(args: AiFunctionCallResponse): Promise<void>
}


export interface AiFunctionCallResponse {
  chatId: string
  response_type: 'text' | 'audio'
  lang: string,
  message: string
  prompt: string
}