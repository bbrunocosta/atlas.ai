import { getUsage } from "../../data/sqlite-repository.js"

export const getBalance = async ({client, venomMessage, userRequest }) => {    
  
  await client.startTyping(venomMessage.from)
  
  const usage = await getUsage(venomMessage.from)
  const balance = 1000 - (1000 * parseFloat(usage))
  
  await client.stopTyping(venomMessage.from)
  await client.sendText(venomMessage.from, "você possui " + Math.trunc(balance) + ' créditos disponíveis')
}