const { Configuration, OpenAIApi } = require("openai");
const express = require('express');
const port = 8000;
const cors = require('cors')
require("dotenv").config();

const app = express()
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Hello World!');
  });

app.listen(port, () => {
console.log(`Server listening at http://localhost:${port}`);
});


const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY, // works
  }); 

app.post('/chatgpt', async (req, res) => {
    const prompt = req.body.input; // works

    const openai = new OpenAIApi(configuration);

    let messages = [
    {
        "role": "user", 
        "content": prompt
    }]

    // Error 429 is RATE LIMIT ERROR

  try {
    const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: messages,
      });

    // console.log(response.data.choices[0].message.content)

    res.send(response.data.choices[0].message.content); // doesnt work
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});

