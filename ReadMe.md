# Ember AI

A self-hosted, lightweight web app for managing and interacting with locally hosted AI models. Ember AI gives you a clean interface for chatting with Ollama models, managing which models are available, and switching between them, all running on your own hardware with no external services involved.

Built by [ForgeLight](https://github.com/ForgeLight-studios).

> **Note:** This repository is the **frontend** only. It talks to the Ember AI backend API (FastAPI + Ollama + SQLite), which must be running for chat and model management to work. The frontend derives the API URL from the current host, so it works both locally and from another device on the network.

## What it does

Ember AI is a management layer and chat interface for locally hosted language models. Right now it targets [Ollama](https://ollama.com), but it's designed so that support for other model backends can be added later.

Current features:

- **Chat interface**: pick an installed model and chat with it. The full conversation is sent to the backend's `/ollama/sendMessage` endpoint, so the model has context from earlier turns, and the reply is rendered in the conversation view. Assistant messages are labelled with the model that produced them, and a spinner shows while a reply is pending
- **Chat and message persistence**: chats and their messages are saved to the database as they happen and loaded back on startup, so conversations survive a reload
- **URL-based navigation**: the active view and open chat are reflected in the URL (React Router: `/chat/:chatId`, `/models`, `/settings`), so reloading keeps you on the same page/chat
- **Model management**: add a model by name and description, which starts a server-side pull with a live progress bar; the pull continues even if you refresh or close the tab, and the app reconnects to an in-progress pull on load
- **Model deletion**: remove a model (from the Models edit view, or a chat's context menu equivalent); deletes it from both Ollama and the database
- **Deleted-model awareness**: opening a chat whose model has since been deleted shows a message in the input naming the model and disables sending
- **Model locking per chat**: the model picker defaults to the first available model and locks once a chat has messages
- **Per-chat context menu**: rename or delete a chat from a kebab menu in the chat list
- **Model lifetime setting**: choose how long a model stays loaded after use (30m / 1h / 2h), sent as `keep_alive`
- **Responsive layout**: a collapsible side menu on desktop, a top bar with an overlay menu on mobile
- **Notifications**, **theme system**, **light/dark mode** (auto-detected on first load), and **persistent theme storage**

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
- **React Router** for URL-based view and chat navigation
- **Vite** for the build tooling and dev server
- **react-select** for the model picker in the chat view
- **nanoid** for client-side chat, message, and notification IDs
- **EventSource (SSE)** for live pull progress
- **ESLint** (flat config) for linting
- **CSS custom properties** for theming; **localStorage** for theme persistence

## Prerequisites

- **Node.js** (a current LTS release is recommended)
- **The Ember AI backend API** running and reachable (defaults to port `3100` on the same host)
- **[Ollama](https://ollama.com)** installed and running

## Getting started

```bash
git clone https://github.com/ForgeLight-studios/ember-ai.git
cd ember-ai
npm install
```

Make sure the backend API is running, then start the dev server:

```bash
npm run dev
```

To reach the app from another device on your network (e.g. a phone), expose the dev server:

```bash
npm run dev -- --host
```

Vite prints a Local and a Network URL. The frontend builds its API URL from `window.location.hostname`, so opening the Network URL on a phone points the API calls at the same host automatically (the backend must be running on `0.0.0.0` and reachable on port 3100).

## Available scripts

- `npm run dev` — Vite dev server with hot reloading (`-- --host` to expose on the network)
- `npm run build` — production build in `dist/`
- `npm run preview` — serve the production build locally
- `npm run lint` — run ESLint

## Project structure

```
ember-ai/
├── index.html
├── vite.config.js
├── eslint.config.js
├── package.json
├── AreYouSure.jsx          Confirmation modal (rendered from App)
└── src/
    ├── main.jsx            React entry point (wraps App in BrowserRouter)
    ├── App.jsx             Root: routing, API helper, notifications, chat state, pull state, dark mode, theme load
    ├── index.css           Global styles, CSS variables, light/dark palettes
    ├── assets/             Logo and menu icons (SVG)
    └── components/
        ├── Header.jsx          Side menu (desktop) / top bar + overlay menu (mobile)
        ├── MenuItem.jsx        Individual menu entry (navigates by route)
        ├── ChatList.jsx        Chat list, "+ New Chat", per-chat kebab context menu
        ├── ContextMenu.jsx     Rename/delete menu for a chat
        ├── PromptChat.jsx      Chat view, model picker, message sending, deleted-model handling
        ├── Message.jsx         A single chat message bubble (with failed state)
        ├── Models.jsx          Add-model form, pull status/progress, model list, edit toggle
        ├── ModelList.jsx       Renders models; edit mode allows description edit and delete
        ├── Spinner.jsx         Loading spinner shown while a reply is pending
        ├── Notifications.jsx   Stacked transient notifications
        ├── Settings.jsx        Display-mode and model-lifetime settings; embeds Themes
        └── Themes.jsx          Theme picker (colour palettes)
```

## How it works

**Routing.** `App.jsx` uses React Router. The active view and open chat come from the URL (`/chat/:chatId`, `/models`, `/settings`) rather than in-memory state, so a reload keeps you on the same page/chat. On mount, `/` redirects to `/chat/newChat`. The API base URL is derived synchronously from `window.location.hostname` (`http://<host>:3100`), so it's correct on the first render and adapts to whichever host the app is opened from.

**App shell.** `App.jsx` holds the shared `apiCallHelper`, notification state, chat state (`chats`, `currentChat`), the selected model, the pull-related state (`isModelPulling`, `progress`, `status`, `currentPullingModel`), dark mode, and theme loading. On startup it loads models (`GET /model/allmodels`, which also returns the currently-pulling model) and chats (`GET /chats/getAllChats`).

**Chat** lives in `PromptChat.jsx`. It reads the open chat from the `:chatId` route param and syncs `currentChat`. On send it validates that a message and model are selected, resolves the target chat once (creating one if needed), and, for the first message, creates the chat via `POST /chats/createChat`. It POSTs the full message history to `/ollama/sendMessage` (with `keep_alive` from the model-lifetime setting) so the model has context, then persists both the user and assistant messages via `POST /chats/createMessage`. A spinner shows while sending; a failed send marks the last message as failed.

**Deleted models.** Because the backend keeps the model name on the chat even after the model is deleted, `PromptChat` compares `currentChat.model` against the installed models; if it's gone, the input shows a "the model for this chat has been deleted" message and the form is disabled.

**Model management** in `Models.jsx`. Adding a model POSTs to `/ollama/pull` to start a server-side pull, then opens an `EventSource` on `/ollama/pull/progress/{model}` to stream progress into a bar. Because the pull runs server-side, it survives a refresh: on load, `currentPullingModel` (from `allmodels`) drives a reconnect that re-adds the temporary "pulling" entry and reattaches the EventSource. `ModelList.jsx` renders the models; in edit mode you can change a description (`PATCH /model/patch`) or delete a model (`DELETE /model/delete`), both gated behind an "are you sure?" confirmation.

**Chat list and context menu.** `ChatList.jsx` renders chats and the "+ New Chat" control, and each chat has a kebab menu (`ContextMenu.jsx`) to rename (`PATCH /chats/patch`) or delete (`DELETE /chats/delete`) it, again behind a confirmation.

**Notifications, theming, dark mode** are handled in `App.jsx` / `Notifications.jsx` and via CSS custom properties: notifications fade in/out on timers, themes write to `localStorage`, and dark mode toggles a `dark-mode` class (auto-detected from `prefers-color-scheme` on first load). Model lifetime and display mode live in `Settings.jsx`.

## Recent work

- **Server-side pull with reconnectable progress.** Pulls are started on the server and watched via `EventSource`; progress survives a refresh or closing the tab, and the app reconnects to an in-progress pull on load, restoring the temporary list entry and bar.
- **URL-based navigation** with React Router, replacing the old `activeView` state switching; reloads keep you on the same page/chat.
- **Model deletion and description editing** from the Models edit view; **chat rename/delete** from a per-chat context menu.
- **Deleted-model chat handling**: a chat whose model was deleted shows a notice and disables input.
- **Conversation memory**, **model auto-select and per-chat locking**, **send on Enter** (Shift+Enter for newline), and a **send spinner**.
- **Network access**: the API URL is derived from the current host; the mobile model picker uses `isSearchable={false}` to avoid popping the keyboard.
- **Layout fixes**: `100dvh` and page clipping to remove a stray overflow, mobile menu overlay, and the `failedMessage` colour.

## Status

Early and evolving. The core loop works end to end: add and pull a model (with progress that survives refresh), chat with conversation context, rename and delete chats, delete models, and have chats persist and reload into the same view. Still missing: accounts / server-side per-user storage, the new-chat first-message edge case, and the broader agent features on the roadmap.

Interfaces, storage, and structure are still changing as the project grows from a UI prototype toward a fuller self-hosted agent workspace. Expect breaking changes between versions for now.