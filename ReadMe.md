# Ember AI

A self-hosted, lightweight web app for managing and interacting with locally hosted AI models. Ember AI gives you a clean interface for chatting with Ollama models, managing which models are available, and switching between them, all running on your own hardware with no external services involved.

Built by [ForgeLight](https://github.com/ForgeLight-studios).

> **Note:** This repository is the **frontend** only. It talks to the Ember AI backend API (FastAPI + Ollama + SQLite), which must be running for chat and model management to work. The frontend expects the API at `http://localhost:3100`.

## What it does

Ember AI is a management layer and chat interface for locally hosted language models. Right now it targets [Ollama](https://ollama.com), but it's designed so that support for other model backends can be added later.

Current features:

- **Chat interface**: pick an installed model and chat with it. Messages are sent to the backend's `/ollama/newChat` endpoint and the model's reply is rendered in the conversation view. Assistant messages are labelled with the name of the model that produced them
- **Chat management**: create new chats from the side menu, with the active chat tracked in app state. Each message is appended to the correct chat by id
- **Model management**: add a model by name and description, which triggers a pull from the Ollama registry with a live streaming progress bar, then lists the models available to use along with their status (`pulling`, `installed`, `failed`)
- **Notifications**: a transient, stacked notification system (with nanoid IDs and CSS transitions) surfaces successes and errors from API calls
- **Theme system** with a set of built-in colour palettes, saved to persistent storage
- **Light and dark mode**, with automatic detection of your system preference on first load
- **Persistent storage** so your theme choice survives a page reload

## Roadmap

Ember AI is under active development. Planned additions include:

- **User login and accounts** with persistent server-side storage, so settings and history follow the user rather than the browser
- **Chat history persistence** backed by the database, so conversations survive a reload (the backend schema and a `getAllChats` endpoint already support chats and messages; the frontend needs to load and hydrate from it)
- **Conversation memory**, so prior turns are sent to the model rather than each message being treated as a fresh chat
- **Support for model backends beyond Ollama**
- **Skills**: extensible capabilities the agent can call on
- **Browser access**: letting the agent read from and act on web pages
- **Bash environment access**: letting the agent run commands in a controlled shell

The near-term focus is memory management and smooth switching between locally hosted Ollama models. The longer-term aim is a fuller self-hosted agent workspace.

## Tech stack

- **React 19** with plain JavaScript (no TypeScript)
- **Vite** for the build tooling and dev server
- **react-select** for the model picker in the chat view
- **nanoid** for client-side chat, message, and notification IDs
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
    ├── App.jsx             Root component: view routing, dark mode, theme load, API helper, model pulling, chat state
    ├── index.css           Global styles, CSS variables, light/dark palettes
    ├── assets/             Logo and menu icons (SVG)
    └── components/
        ├── Header.jsx          Collapsible side menu
        ├── MenuItem.jsx        Individual menu entry
        ├── ChatList.jsx        Chat list and "+ New Chat" control in the menu
        ├── PromptChat.jsx      The chat / prompt view, model picker, message sending
        ├── Message.jsx         A single chat message bubble (user or AI)
        ├── Models.jsx          Add-model form and pull-status display
        ├── ModelList.jsx       Renders the list of available models
        ├── Notifications.jsx   Renders the stacked transient notifications
        └── Themes.jsx          Theme picker and display-mode settings
```

## How it works

The app shell in `App.jsx` manages which view is active (Home, Models, or Themes) and renders the matching component. A collapsible side menu drives navigation. `App.jsx` also holds the shared `apiCallHelper` used for talking to the backend, the notification state, the chat state (`chats` and `currentChat`), and the model-pulling logic.

**Chat** lives in `PromptChat.jsx`. It renders a model picker (via react-select) populated from the loaded models, and a message box. On send it validates that both a message and a model are selected, appends the user message to the current chat, POSTs the chosen model and message to `/ollama/newChat`, and appends the reply to the same chat by id. The chat being written to is resolved once up front (creating a new chat if needed) and that id is threaded through the whole send, so the user message and the reply always land in the same chat rather than reading chat state back mid-handler. Note that there is currently no conversation memory: only the single current message is sent to the model, with no prior turns included, so every message is effectively treated as a brand new chat and the model has no recollection of anything said before it.

**New chats** are created from the side menu (`ChatList.jsx`). Creating a chat generates a nanoid id, adds it to `chats`, and sets it as the current chat. The newly created chat object is used directly rather than searched for in state immediately after creation, since state updates are not applied synchronously.

**Model management** in `Models.jsx` captures a name and description and calls `pullModel` in `App.jsx`. That first registers the model in the database (`POST /model/create` with status `pulling`), then streams the pull from `/ollama/pull`, reading the Server-Sent Events to update a progress bar. Because the pull response is a stream, the raw `fetch` response is consumed with a reader rather than `response.json()` (calling `.json()` would consume the stream and block until it ends). Streamed `error` chunks are handled inside the read loop and patch the model to `failed`; on completion it patches to `installed` via `PATCH /model/status`. The full model list is loaded once on startup from `GET /model/allmodels`.

**Notifications** are handled in `App.jsx` and rendered by `Notifications.jsx`. Each notification is given a nanoid ID, faded in, then removed after a short delay using timed state updates and CSS transitions.

**Theming** is handled through CSS custom properties defined in `index.css`. Selecting a theme updates the `--secondary` and `--tertiary` colour variables (and their dark-mode counterparts) on the document root, and the chosen theme is written to `localStorage` so it persists. A default theme (Sparkr Original) is applied on first load if none has been saved.

**Dark mode** is toggled by adding or removing a `dark-mode` class on the document root. On first load the app checks the system `prefers-color-scheme` setting and starts accordingly.

## Recent fixes

- **Messages can no longer be sent without a selected model.** The send guard now checks the selected model has a valid name, not just that a model object is present.
- **Assistant name now displays on AI messages.** A backwards ternary was passing an empty string in place of the model name; the value is now passed through to the message bubble.
- **Send flow writes to the correct chat.** The target chat id is resolved once and reused for both the user message and the reply, fixing replies landing in the wrong chat (or not appearing) after creating a new chat.
- **"+ New Chat" no longer calls its handler on every render.** The handler is passed by reference rather than invoked during render.
- **The chat list now collapses when the menu is closed.** Closing the side menu also collapses the chat list rather than leaving it open.
- **"+ New Chat" disable logic widened.** The button is now disabled when any chat is an unused "New chat", rather than only when the current chat is, preventing multiple empty "New chat" entries.

## Known issues

- **No conversation memory.** Each message is sent on its own with no prior context, so the model does not remember earlier turns in the same chat.

## Status

Early and evolving. The core loop now works end to end against the backend: you can add and pull an Ollama model, watch its progress, create chats, and chat with an installed model with the model's name shown on its replies. What is still missing is persistence beyond the browser (no accounts yet, and chat history is not yet loaded back from the database on reload), conversation memory, and the broader agent features on the roadmap.

Interfaces, storage, and structure are still changing as the project grows from a UI prototype toward a fuller self-hosted agent workspace. Expect breaking changes between versions for now.