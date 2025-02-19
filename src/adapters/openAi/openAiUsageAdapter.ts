import { AiPricingRules, AiUsagePort } from '../../ports/AiUsagePort'


class OpenAiUsageAdapter implements AiUsagePort {

  constructor(private readonly rules: AiPricingRules){}

  calculateCost(response: any, options: any): number {
    const modelPricingRules = this.rules[options.model] 
    if(!modelPricingRules) throw new Error(`There are no configured price rules for the model ${options.model}`)
    
    const usage = this.extractUsageFromResponse(response)
    const amountSpent =  modelPricingRules.reduce((total, rule) => {
      return total + this.calculateCostByRule(rule, usage)
    }, 0)
  
    return this.convertDollarsToCredits(amountSpent)
  }
  
  private calculateCostByRule({ type, unitAmount, price }, usage) {
    return price / unitAmount * (usage[type] ?? 1 )
  }

  private  convertDollarsToCredits(amountInDollar) {
    return amountInDollar * 6000
  }

  private extractUsageFromResponse(response) {
    return {
      completion_tokens: response.usage?.completion_tokens,
      cached_tokens: response.usage?.prompt_tokens_details?.cached_tokens,
      prompt_tokens: response.usage?.prompt_tokens
    }
  }
}


export default OpenAiUsageAdapter











