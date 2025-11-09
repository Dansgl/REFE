import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/search', async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Missing query' });
  }

  if (!OPENROUTER_API_KEY) {
    return res.status(500).json({
      error: 'OpenRouter API key is not configured. Set OPENROUTER_API_KEY in your environment.'
    });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.OPENROUTER_APP_URL || 'http://localhost:3000',
        'X-Title': 'Reference Machine'
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a cultural research assistant. Given a film, book, or artwork, produce a JSON payload with thematic threads, cross-media references, contemporary links, and conversation starters.'
          },
          {
            role: 'user',
            content: `Query: ${query}. Respond as JSON with keys: title, synopsis, themes (array of {title, insight}), crossMedia (array of {medium, title, creator, description}), contemporaryResonance (array of strings), conversationStarters (array of strings), furtherExploration (array of {title, medium, why}).`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: 'OpenRouter error', details: errorText });
    }

    const data = await response.json();
    const messageContent = data.choices?.[0]?.message?.content;

    if (!messageContent) {
      return res.status(502).json({ error: 'No content returned from OpenRouter' });
    }

    let parsed;
    try {
      parsed = JSON.parse(messageContent);
    } catch (error) {
      return res.status(502).json({
        error: 'Failed to parse OpenRouter response as JSON',
        details: messageContent
      });
    }

    return res.json(parsed);
  } catch (error) {
    console.error('Search error', error);
    return res.status(500).json({ error: 'Unexpected server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Reference machine listening on http://localhost:${PORT}`);
});
