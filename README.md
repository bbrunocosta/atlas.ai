# zap-gpt
WhatsApp integration with OpenAI Chat GPT for personal use at your fingertips
# How to inicialize this project

### 1) Configuring ".env" file
Let's start setting up all enviroment variables needed for this project to work.
In the project root folder, create a file called ".env" 
and fill the variables as shown in this code below.

```js
OPEN_AI_API_KEY="your-api-key"
OPEN_AI_ORGANIZATION_ID="your-organization-id"
WHATSAPP_PHONE_NUMBER=your-whatsapp-number  like -> 553144448888@c.us
```
In order to get the OpenAi OrganizationId and ApiKey you first need to create an OpenAi accont and then visit the following links:

#### ApiKey
https://beta.openai.com/account/api-keys

#### OrganizationId
https://beta.openai.com/account/org-settings


There is a file called .env.example with the same exemple shown above.

### 2) Start the application
Now that all enviroment variables are set, you can start the projet. Run the terminal command "yarn start" in the root folder of your project


```terminal
yarn start
```

the proram will start and a QR code will show up on the terminal.
just scan the QrCode as a new device of you WhatsApp app.

### 3) Execute a commannd

There are two types of commands that you can play with:

**/imagine** - use it in order to generate images! <Br>
it uses  Dall-E witch is a AI that generates images 
```whatsapp
/imagine A black cat
```
with this request the bot will try to answare with a image.


<br>
<br>
**/bot** - use it in order to generate text!
<br>
it uses Davinci witch is a AI that generate text

```whatsapp
/bot How is the whether now?
```
with this question the bot will try to answare with a text message.
