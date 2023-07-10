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

  axios
    .post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'text-davinci-003',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: question }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        }
      }
    )
    .then((response) => {
      const answer = response.data.choices[0].message.content.trim();
      res.json({ answer });
    })
    .catch((error) => {
      console.error('Error:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    });
});

function extractBodyText(html) {
  const $ = cheerio.load(html);
  const bodyText = $('body').text();
  return bodyText;
}

const port = process.env.PORT || 4000
app.listen(port, () => {
    console.log(`backend running on port ${port}!`);
});