export interface AiUsagePort {
  calculateCost(response: any, options: any): number
}

export interface AiPricingRules {
  [model: string]: {
    type: string,
    unitAmount: number,
    price: number
  }[]
}