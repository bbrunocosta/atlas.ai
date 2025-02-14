
<p align="center">
      <img src="https://repository-images.githubusercontent.com/594485098/da696f60-dc49-4007-8ccb-19d077cc2062" width="500">
</p>

<a href="https://wa.me/5511930584364" target="_blank">
  <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" width="12" height="12" style="vertical-align: middle;">
  Clique aqui para testar!
</a>


# Atlas - AI WhatsApp Integration
🚀 **WhatsApp Integration with OpenAI's Chat-GPT** 🚀
Seamlessly integrate OpenAI's Chat-GPT with WhatsApp, allowing users to interact with an AI assistant for text-based responses and AI-generated images using DALL·E.

---

## 📌 Features

✅ AI-powered text responses using **GPT-4o-mini**  
✅ AI-generated images using **DALL·E 3**  
✅ Smooth integration with WhatsApp via **WPPConnect**  
✅ SQLite database for chat history tracking  
✅ Usage-based credit system for limiting interactions  
✅ Simple setup and deployment  

---

## 🛠️ Setup & Installation

### 1️⃣ Configure Environment Variables

Start by setting up the required environment variables. In the project's root directory, create a `.env` file and add the following details:

```ini
OPEN_AI_API_KEY="your-api-key"
OPEN_AI_ORGANIZATION_ID="your-organization-id"
WHATSAPP_PHONE_NUMBER=your-whatsapp-number  # Example: 553144448888@c.us
```

📌 **How to get OpenAI credentials?**
- **API Key:** [Get it here](https://beta.openai.com/account/api-keys)
- **Organization ID:** [Find it here](https://beta.openai.com/account/org-settings)

💡 *An example file `.env.example` is included in the project with the same template.*

---

### 2️⃣ Install Dependencies

Before running the project, ensure you have **Node.js** installed and install all required dependencies using **Yarn**:

```sh
yarn install
```

---

### 3️⃣ Start the Application

Once all environment variables are configured, start the project by running:

```sh
yarn start
```

This will generate a **QR Code** in the terminal. Scan this QR Code using your WhatsApp application to establish the connection.

✅ **Once authenticated, the bot will be ready to process your commands!**

---

## 📜 Technologies Used

🔹 **[WPPConnect](https://wppconnect.io/)** - WhatsApp API integration  
🔹 **[OpenAI](https://openai.com/)** - AI text & image generation  
🔹 **SQLite** - Lightweight database for chat history tracking  
🔹 **Zod** - Data validation  
🔹 **Axios** - HTTP requests  
🔹 **Puppeteer** - Headless browser automation  

---

## 👨‍💻 Author

🔹 **Bruno Costa** - [GitHub](https://github.com/bbrunocosta)  

If you find this project useful, feel free to ⭐ star it on GitHub!

---

## 🔥 Future Improvements

🔸 Enable the bot to process all message types, including *audio, video, and documents*

📌 *Have a suggestion? Open an issue or contribute to the project!* 🚀

