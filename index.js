const express = require('express');

const cheerio = require('cheerio');
require('dotenv').config();
const path = require('path');

const { default: axios } = require('axios');

const app = express();


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const apiKey = process.env.OPENAI_API_KEY;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/favicon.ico', (req, res) => {
    res.sendStatus(204);
  });

app.post('/ask', async (req, res) => {
  const { url, question } = req.body;

  try {
    const response = await axios.get(url);
    const bodyText = extractBodyText(response.data);

    const prompt = `${bodyText}\n\nQ: ${question}\nA:`;

    const chatResponse = await axios.post('https://api.openai.com/v1/engines/text-davinci-003/completions', {
      prompt,
      max_tokens: 200,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    });

    const answer = chatResponse.data.choices[0].text.trim();

    res.json({ answer });
  } catch (error) {
    console.error('Error:', error.response?.data?.error || error.message);
    const statusCode = error.response?.status || 500;
    res.status(statusCode).json({ error: 'Internal server error' });
  }
});

function extractBodyText(html) {
  const $ = cheerio.load(html);
  const bodyText = $('body').text();
  return bodyText;
}

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`backend running on port ${port}!`);
});