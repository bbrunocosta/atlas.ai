import { getResponseHandler } from "./responseHandlers.js";

export const onAnyMessage = (client, message, commands) => {

    let clientCommand = message.text.substring(0, message.text.indexOf(" "));
    let clientRequest = message.text.substring(message.text.indexOf(" "));

    var command = commands.getCommand(clientCommand)
    if(command) execCommand(command)

    function execCommand (command) {
        const responseHandler  = getResponseHandler(command.responseType)
        command.action(clientRequest).then(response => responseHandler(client, message, response, clientRequest))
    }
}