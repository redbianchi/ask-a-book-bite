require('dotenv').config();
const express = require('express');
const { default: axios } = require('axios');
const path = require('path');

const app = express();
const port = 3000; // Change the port number if needed

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const apiKey = process.env.OPENAI_API_KEY;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/ask', async (req, res) => {
  const { question, context } = req.body;

  const prompt = `${context}\n\nQ: ${question}\nA:`;

  try {
    const response = await axios.post('https://api.openai.com/v1/engines/text-davinci-003/completions', {
      prompt,
      max_tokens: 200,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    });

    // Extract the answer from the response
    const answer = response.data.choices[0].text;

    res.json({ answer });
  } catch (error) {
    console.error('ChatGPT API call failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }

});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
