import defaultMessages from "../whatsapp/default-messages.js";
import { upsertTranslation } from "./sqlite-repository.js";
export async function  seedDefaultTranslations (){
  for(const key in defaultMessages)  {
    await upsertTranslation(key, 'pt-br', defaultMessages[key])
  }
}

