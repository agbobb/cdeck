# Context Deck

A small cross-platform desktop app (Electron) for writing Claude context `.md` files and tracking daily / prompt notes. Notes are stored as real markdown files in the `data/` folder next to the app.

## Run it

Requires [Node.js](https://nodejs.org).

- **Windows:** double-click `start.bat`
- **macOS / Linux:** `chmod +x start.command` once, then double-click it (or run `npm start` in a terminal)

The first launch runs `npm install` automatically (downloads Electron). After that it opens instantly.

## Where notes live

```
data/
  context/   context .md files (+ folders)
  daily/     one YYYY-MM-DD.md per day, auto-created
  prompts/   reusable prompts
```

The header breadcrumb opens the current tab's folder in Finder/Explorer. **Copy path** copies the current file's full path (handy for ComfyUI, etc.).

## Optional: build installers

Everything above runs from source on both OSes. To produce a packaged app (`.exe` / `.dmg`):

```
npm install --save-dev electron-builder
npx electron-builder --win        # or --mac / --linux
```

(Build for macOS on a Mac, Windows on Windows.)
