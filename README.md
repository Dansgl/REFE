# Reference Machine web app

A text-first explorer that lets you drop a cultural work (film, book, album, exhibition) and receive a structured map of themes, cross-media echoes, and conversation sparks. The interface focuses on a Google-style query bar with an infinite canvas of nestable cards for the generated references.

## Features

- **Search-first flow** – a centered query bar keeps the surface minimal until you ask for something.
- **Infinite canvas board** – drag to pan and scroll to zoom around the card space so future iterations can host multiple clusters.
- **Nestled cards** – each result is structured into thematic threads, cross-media echoes, contemporary resonance, conversation starters, and further exploration pathways.
- **OpenRouter powered research** – the server proxies your request to the OpenRouter API so you can plug in different models that synthesize web knowledge.

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env` file in the project root (or set variables in your shell) with:

```
OPENROUTER_API_KEY=your_api_key
# Optional overrides
OPENROUTER_MODEL=openai/gpt-4o-mini
OPENROUTER_APP_URL=https://your-domain.example
PORT=3000
```

You can obtain an API key from [OpenRouter](https://openrouter.ai/). `OPENROUTER_APP_URL` and the custom `X-Title` header comply with their usage guidelines.

### 3. Run the app

```bash
npm run dev
```

Then visit [http://localhost:3000](http://localhost:3000) to try the interface. Enter any cultural work (e.g., “Bugonia by Yorgos Lanthimos”) and wait for the results card to spool up. Drag anywhere on the board to pan, and use the mouse wheel or trackpad scroll to zoom.

## Implementation notes

- The Express server lives in [`server.js`](./server.js) and exposes a `/api/search` endpoint that forwards the query to OpenRouter, expecting a JSON-structured reply.
- Static assets reside in [`public/`](./public) with [`index.html`](./public/index.html), [`styles.css`](./public/styles.css), and [`app.js`](./public/app.js) handling the search UI, styling, and canvas interactions.
- The front-end currently renders a single card per request. The board state system already tracks pan and zoom so extending to multiple cards or clustering will only require adding layout logic.
- Error paths surface helpful messaging if the OpenRouter key is missing or the response cannot be parsed as JSON.

## Roadmap ideas

- Stack multiple cards for multi-query explorations.
- Add quick save stacks or export to shareable briefs.
- Introduce lightweight user accounts to persist personal reference boards.
- Layer in timeline or graph layouts to show relationships between references.
