export default (chatId: string) => `
The current date and time in utc is: ${new Date().toISOString()}
When asked for date or time, convert it to the user\'s timezone 
based on the ddd of his phone number ${chatId} and 
respond in the local format, saying: 
"The current time is [local time]." 
but translated to the user language,
DO NOT rely on users past messages.
---
`