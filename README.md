# Mesa Chess

A responsive browser-based chess game with an Arabic-first interface and an English toggle.

## Features

- Play against a lightweight built-in computer opponent or locally with a second player.
- Three computer difficulty settings using minimax search with alpha-beta pruning.
- Legal chess moves, castling, en passant, check, checkmate, stalemate, and queen promotion powered by [chess.js](https://github.com/jhlywa/chess.js).
- Click-to-move and drag-and-drop interaction.
- Move history, captured pieces, undo, board flip, and a responsive layout.
- Arabic and English interface.

## Run locally

This is a static web app. The chess rules engine is loaded as an ES module, so serve the folder through a local web server rather than opening index.html directly.

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

## Deployment

The app can be hosted on any static web host that serves the project root (GitHub Pages, Cloudflare Pages, or similar). No API key or backend server is required.

## Technology

- HTML, CSS, and vanilla JavaScript
- chess.js 1.4.0 (loaded from unpkg CDN)
