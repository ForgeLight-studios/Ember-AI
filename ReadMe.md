# Ember AI

A self-hosted, lightweight web app for managing and interacting with locally hosted AI models. Ember AI gives you a clean interface for chatting with Ollama models, managing which models are available, and switching between them, all running on your own hardware with no external services involved.

Built by [ForgeLight](https://github.com/ForgeLight-studios).

> **Note:** This repository is the **frontend** only. It talks to the Ember AI backend API (FastAPI + Ollama + SQLite), which must be running for chat and model management to work. The frontend expects the API at `http://localhost:3100`.

## What it does

Ember AI is a management layer and chat interface for locally hosted language models. Right now it targets [Ollama](https://ollama.com), but it's designed so that support for other model backends can be added later.

Current features:

- **Chat interface**: pick an installed model and chat with it. Messages are sent to the backend's `/ollama/newChat` endpoint and the model's reply is rendered in the conversation view
- **Model management**: add a model by name and description, which triggers a pull from the Ollama registry with a live streaming progress bar, then lists the models available to use along with their status (`pulling`, `installed`, `failed`)
- **Notifications**: a transient, stacked notification system (with nanoid IDs and CSS transitions) surfaces successes and errors from API calls
- **Theme system** with a set of built-in colour palettes, saved to persistent storage
- **Light and dark mode**, with automatic detection of your system preference on first load
- **Persistent storage** so your theme choice survives a page reload

## Roadmap

Ember AI is under active development. Planned additions include:

- **User login and accounts** with persistent server-side storage, so settings and history follow the user rather than the browser
- **Chat history persistence** backed by the database, so conversations survive a reload (the schema already supports chats and messages)
- **Support for model backends beyond Ollama**
- **Skills**: extensible capabilities the agent can call on
- **Browser access**: letting the agent read from and act on web pages
- **Bash environment access**: letting the agent run commands in a controlled shell

The near-term focus is memory management and smooth switching between locally hosted Ollama models. The longer-term aim is a fuller self-hosted agent workspace.

## Tech stack

- **React 19** with plain JavaScript (no TypeScript)
- **Vite** for the build tooling and dev server
- **react-select** for the model picker in the chat view
- **nanoid** for client-side notification IDs
- **ESLint** (flat config) for linting
- **CSS custom properties** for theming, including full light and dark palettes
- **Browser localStorage** for theme persistence

## Prerequisites

- **Node.js** (a current LTS release is recommended)
- **The Ember AI backend API** running and reachable at `http://localhost:3100`
- **[Ollama](https://ollama.com)** installed and running

## Getting started

Clone the repository and install dependencies:

```bash
git clone https://github.com/ForgeLight-studios/ember-ai.git
cd ember-ai
npm install
```

Make sure the backend API is running, then start the development server:

```bash
npm run dev
```

Vite will print a local URL (typically `http://localhost:5173`) to open in your browser. Note that the backend's CORS config expects the frontend on this origin.

## Available scripts

- `npm run dev` starts the Vite development server with hot reloading
- `npm run build` produces a production build in `dist/`
- `npm run preview` serves the production build locally for a final check
- `npm run lint` runs ESLint across the project

## Project structure

```
ember-ai/
├── index.html              Entry HTML, mounts the app at #root
├── vite.config.js          Vite + React plugin config
├── eslint.config.js        ESLint flat config
├── package.json
└── src/
    ├── main.jsx            React entry point
    ├── App.jsx             Root component: view routing, dark mode, theme load, API helper, model pulling
    ├── index.css           Global styles, CSS variables, light/dark palettes
    ├── assets/             Logo and menu icons (SVG)
    └── components/
        ├── Header.jsx          Collapsible side menu
        ├── MenuItem.jsx        Individual menu entry
        ├── PromptChat.jsx      The chat / prompt view, model picker, message sending
        ├── Message.jsx         A single chat message bubble (user or AI)
        ├── Models.jsx          Add-model form and pull-status display
        ├── ModelList.jsx       Renders the list of available models
        ├── Notifications.jsx   Renders the stacked transient notifications
        └── Themes.jsx          Theme picker and display-mode settings
```

## How it works

The app shell in `App.jsx` manages which view is active (Home, Models, or Themes) and renders the matching component. A collapsible side menu drives navigation. `App.jsx` also holds the shared `apiCallHelper` used for talking to the backend, the notification state, and the model-pulling logic.

**Chat** lives in `PromptChat.jsx`. It renders a model picker (via react-select) populated from the loaded models, and a message box. On send, it POSTs the chosen model and message to `/ollama/newChat` and appends the reply to the conversation. Note that there is currently no conversation memory: only the single current message is sent to the model, with no prior turns included, so every message is effectively treated as a brand new chat and the model has no recollection of anything said before it.

**Model management** in `Models.jsx` captures a name and description and calls `pullModel` in `App.jsx`. That first registers the model in the database (`POST /model/create` with status `pulling`), then streams the pull from `/ollama/pull`, reading the Server-Sent Events to update a progress bar. On completion it patches the model to `installed` (or `failed` on error) via `PATCH /model/status`. The full model list is loaded once on startup from `GET /model/allmodels`.

**Notifications** are handled in `App.jsx` and rendered by `Notifications.jsx`. Each notification is given a nanoid ID, faded in, then removed after a short delay using timed state updates and CSS transitions.

**Theming** is handled through CSS custom properties defined in `index.css`. Selecting a theme updates the `--secondary` and `--tertiary` colour variables (and their dark-mode counterparts) on the document root, and the chosen theme is written to `localStorage` so it persists. A default theme (Sparkr Original) is applied on first load if none has been saved.

**Dark mode** is toggled by adding or removing a `dark-mode` class on the document root. On first load the app checks the system `prefers-color-scheme` setting and starts accordingly.

## Status

Early and evolving. The core loop now works end to end against the backend: you can add and pull an Ollama model, watch its progress, and chat with an installed model. There is currently no conversation memory, though: each message is sent on its own with no prior context, so every message is treated as a fresh chat and the model does not remember earlier turns. What is also still missing is persistence beyond the browser (no accounts yet, and chat history is not saved between reloads) and the broader agent features on the roadmap.

Interfaces, storage, and structure are still changing as the project grows from a UI prototype toward a fuller self-hosted agent workspace. Expect breaking changes between versions for now.

## License

See the repository for license details.