# Ember AI

A self-hosted, lightweight web app for managing and interacting with locally hosted AI models. Ember AI gives you a clean interface for chatting with Ollama models, managing which models are available, and switching between them, all running on your own hardware with no external services involved.

Built by [ForgeLight](https://github.com/ForgeLight-studios).

> **Note:** Ember AI does not currently let you interact with models. The chat interface is not yet connected to Ollama, so sending a prompt will not return a response. What works today is the UI shell: navigation, model management, and theming. See [Status](#status) for details.

## What it does

Ember AI is a management layer and chat interface for locally hosted language models. Right now it targets [Ollama](https://ollama.com), but it's designed so that support for other model backends can be added later.

Current features:

- **Chat interface** (UI only for now): the prompt view is built, but it is not yet connected to a model backend, so it does not return responses
- **Model management**: add, describe, and list the models available to use
- **Theme system** with a set of built-in colour palettes, saved to persistent storage
- **Light and dark mode**, with automatic detection of your system preference on first load
- **Persistent storage** so your theme and model choices survive a page reload

## Roadmap

Ember AI is under active development. Planned additions include:

- **User login and accounts** with persistent server-side storage, so settings and history follow the user rather than the browser
- **Persistent model management** backed by a real datastore rather than local browser storage
- **Support for model backends beyond Ollama**
- **Skills**: extensible capabilities the agent can call on
- **Browser access**: letting the agent read from and act on web pages
- **Bash environment access**: letting the agent run commands in a controlled shell

The near-term focus is memory management and smooth switching between locally hosted Ollama models. The longer-term aim is a fuller self-hosted agent workspace.

## Tech stack

- **React 19** with plain JavaScript (no TypeScript)
- **Vite** for the build tooling and dev server
- **ESLint** (flat config) for linting
- **CSS custom properties** for theming, including full light and dark palettes
- **Browser localStorage** for the current persistence layer

## Prerequisites

- **Node.js** (a current LTS release is recommended)
- **[Ollama](https://ollama.com)** installed and running, with at least one model pulled. For example:

  ```bash
  ollama pull llama3.2
  ```

## Getting started

Clone the repository and install dependencies:

```bash
git clone https://github.com/ForgeLight-studios/ember-ai.git
cd ember-ai
npm install
```

Start the development server:

```bash
npm run dev
```

Vite will print a local URL (typically `http://localhost:5173`) to open in your browser.

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
    ├── App.jsx             Root component: view routing, dark mode, theme load
    ├── index.css           Global styles, CSS variables, light/dark palettes
    ├── assets/             Logo and menu icons (SVG)
    └── components/
        ├── Header.jsx      Collapsible side menu
        ├── MenuItem.jsx    Individual menu entry
        ├── PromptChat.jsx  The chat / prompt view
        ├── Models.jsx      Add-model form and model state
        ├── ModelList.jsx   Renders the list of available models
        └── Themes.jsx      Theme picker and display-mode settings
```

## How it works

The app shell in `App.jsx` manages which view is active (Home, Models, or Themes) and renders the matching component. A collapsible side menu drives navigation.

**Theming** is handled through CSS custom properties defined in `index.css`. Selecting a theme updates the `--secondary` and `--tertiary` colour variables (and their dark-mode counterparts) on the document root, and the chosen theme is written to `localStorage` so it persists. A default theme is applied on first load if none has been saved.

**Dark mode** is toggled by adding or removing a `dark-mode` class on the document root. On first load the app checks the system `prefers-color-scheme` setting and starts accordingly.

**Model management** currently keeps the model list in React state, with an add-model form that captures a name and a short description. This is the area slated to move onto a persistent, login-backed datastore as the roadmap progresses.

## Status

Early and evolving, and not yet functional as a chat tool. The app does not currently connect to Ollama or any other backend, so you cannot interact with models through it yet. At this stage it is a working UI shell: the side-menu navigation, the model add/list flow, the theme picker, and light/dark mode all work, but they are not backed by a running model or by persistent server-side storage.

Interfaces, storage, and structure are still changing as the project grows from a UI prototype toward a fuller self-hosted agent workspace. Expect breaking changes between versions for now.

## License

See the repository for license details.