export interface EventBussPort
{
  emit(id: string, data: any ): Promise<void>
  emitDebounced(id: string, data: any, seconds: number ): Promise<void>
}