import rules from './settings/openai-prices.js'

export default {
  calculateCost
}

export function calculateCost(response, options) {
  const modelPricingRules = rules[options.model] 
  if(!modelPricingRules) throw new Error(`There are no configured price rules for the model ${options.model}`)
  
  const usage = extractUsageFromResponse(response)
  const amountSpent =  modelPricingRules.reduce((total, rule) => {
    return total + calculateCostByRule(rule, usage)
  }, 0)

  return convertDollarsToCredits(amountSpent)
}


function calculateCostByRule({ type, unitAmount, price }, usage) {
  return price / unitAmount * (usage[type] ?? 1 )
}


function convertDollarsToCredits(amountInDollar) {
  return amountInDollar * 6000
}


function extractUsageFromResponse(response) {
  return {
    completion_tokens: response.usage?.completion_tokens,
    cached_tokens: response.usage?.prompt_tokens_details?.cached_tokens,
    prompt_tokens: response.usage?.prompt_tokens
  }
}



