export interface UsageRepository
{
  upsertCredits(chatId: string, ammountSpent: number, isRecharge?: boolean ): Promise<number>
  getCredits(chatId: string): Promise<number>
}