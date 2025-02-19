export interface UsageRepository
{
  upsertCredits(chatId: string, ammountSpent: number, isRecharge?: boolean ): Promise<number>
}