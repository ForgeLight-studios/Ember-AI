# Ember AI

A self-hosted, lightweight web app for managing and interacting with locally hosted AI models. Ember AI gives you a clean interface for chatting with Ollama models, managing which models are available, and switching between them, all running on your own hardware with no external services involved.

Built by [ForgeLight](https://github.com/ForgeLight-studios).

> **Note:** This repository is the **frontend** only. It talks to the Ember AI backend API (FastAPI + Ollama + SQLite), which must be running for chat and model management to work. The frontend expects the API at `http://localhost:3100`.

## What it does

Ember AI is a management layer and chat interface for locally hosted language models. Right now it targets [Ollama](https://ollama.com), but it's designed so that support for other model backends can be added later.

Current features:

- **Chat interface**: pick an installed model and chat with it. The full conversation is sent to the backend's `/ollama/sendMessage` endpoint, so the model has context from earlier turns, and the reply is rendered in the conversation view. Assistant messages are labelled with the name of the model that produced them
- **Chat and message persistence**: chats and their messages are saved to the database as they happen, and loaded back on startup, so conversations survive a reload
- **Chat management**: create new chats from the side menu, with the active chat tracked in app state. Each message is appended to the correct chat by id
- **Model management**: add a model by name and description, which triggers a pull from the Ollama registry with a live streaming progress bar, then lists the models available to use along with their status (`pulling`, `installed`, `failed`)
- **Model locking per chat**: the model picker defaults to the first available model and locks once a chat has messages, so a conversation stays with one model
- **Notifications**: a transient, stacked notification system (with nanoid IDs and CSS transitions) surfaces successes and errors from API calls
- **Theme system** with a set of built-in colour palettes, saved to persistent storage
- **Light and dark mode**, with automatic detection of your system preference on first load
- **Persistent storage** so your theme choice survives a page reload

## Roadmap

Ember AI is under active development. Planned additions include:

- **User login**
- **Support for model backends beyond Ollama**
- **Skills**: extensible capabilities the agent can call on
- **Browser access**: letting the agent read from and act on web pages
- **Bash environment access**: letting the agent run commands in a controlled shell

The near-term focus is smooth switching between locally hosted Ollama models and a solid chat-history experience. The longer-term aim is a fuller self-hosted agent workspace.

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

The app shell in `App.jsx` manages which view is active (Chat, Models, or Themes) and renders the matching component. A collapsible side menu drives navigation. `App.jsx` also holds the shared `apiCallHelper` used for talking to the backend, the notification state, the chat state (`chats` and `currentChat`), the selected model, and the model-pulling logic. On startup it loads both the installed models (`GET /model/allmodels`) and the saved chats (`GET /chats/getAllChats`), so history is restored when the app opens.

**Chat** lives in `PromptChat.jsx`. It renders a model picker (via react-select) populated from the loaded models, and a message box. On send it validates that both a message and a model are selected, resolves the target chat once up front (creating one if needed), appends the user message to that chat, and POSTs the full message history to `/ollama/sendMessage` so the model has prior context. The chat id is threaded through the whole send, so the user message and the reply always land in the same chat rather than reading chat state back mid-handler. The user and assistant messages are persisted to the database via `POST /chats/createMessage`, and a failed send rolls the optimistic message back out of view.

**Persistence.** New chats are created via `POST /chats/createChat` and messages via `POST /chats/createMessage`; the chat must be created before its first message, since the backend enforces a foreign key from message to chat. Saved chats are loaded on startup and hydrated into state, so conversations survive a reload.

**New chats** are created from the side menu (`ChatList.jsx`). Creating a chat generates a nanoid id, adds it to `chats`, and sets it as the current chat. The newly created chat object is used directly rather than searched for in state immediately after creation, since state updates are not applied synchronously.

**Model management** in `Models.jsx` captures a name and description and calls `pullModel` in `App.jsx`. That first registers the model in the database (`POST /model/create` with status `pulling`), then streams the pull from `/ollama/pull`, reading the Server-Sent Events to update a progress bar. Because the pull response is a stream, the raw `fetch` response is consumed with a reader rather than `response.json()` (calling `.json()` would consume the stream and block until it ends). Streamed `error` chunks are handled inside the read loop and patch the model to `failed`; on completion it patches to `installed` via `PATCH /model/status`. The full model list is loaded once on startup from `GET /model/allmodels`.

**Notifications** are handled in `App.jsx` and rendered by `Notifications.jsx`. Each notification is given a nanoid ID, faded in, then removed after a short delay using timed state updates and CSS transitions.

**Theming** is handled through CSS custom properties defined in `index.css`. Selecting a theme updates the `--secondary` and `--tertiary` colour variables (and their dark-mode counterparts) on the document root, and the chosen theme is written to `localStorage` so it persists. A default theme (Sparkr Original) is applied on first load if none has been saved.

**Dark mode** is toggled by adding or removing a `dark-mode` class on the document root. On first load the app checks the system `prefers-color-scheme` setting and starts accordingly.

## Recent fixes

- **Chat and message persistence with startup hydration.** Chats and messages are saved to the database as they happen and loaded back on startup, so conversations survive a reload.
- **Conversation memory.** The full message history is now sent to the model, so it has context from earlier turns rather than treating each message as a fresh chat.
- **Model auto-select and per-chat locking.** The picker defaults to the first available model and locks once a chat has messages.
- **Send on Enter** in the message box (Shift+Enter for a newline).
- **Fixed `apiCallHelper` misuse** where the response was parsed twice (`.json()` on an already-parsed object), which was throwing and silently dropping loaded chats.
- **Assistant name displays on AI messages**, and messages write to the correct chat via a single resolved chat id threaded through the send.
- **"+ New Chat"** no longer fires on every render, collapses with the menu, and is disabled when an unused "New chat" already exists.

## Known issues

- **Foreign-key error when sending the first message in an explicitly-created chat.** Creating a chat via "+ New Chat" and then sending can fail to persist that first message, because the chat row is not always inserted before the message references it. Typing into the empty chat window on load persists correctly.

## Status

Early and evolving. The core loop works end to end against the backend: you can add and pull an Ollama model, watch its progress, chat with an installed model with conversation context and the model's name on its replies, and have chats and messages persist across reloads. What is still missing is accounts and server-side per-user storage, the foreign-key edge case noted above, and the broader agent features on the roadmap.

Interfaces, storage, and structure are still changing as the project grows from a UI prototype toward a fuller self-hosted agent workspace. Expect breaking changes between versions for now.