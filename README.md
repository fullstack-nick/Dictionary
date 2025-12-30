# Dictionary App

A client-side dictionary lookup app that fetches English definitions, phonetics, and audio pronunciations.

## Overview

Dictionary App is a static, browser-based tool for quick word lookups. It targets learners and writers who want definitions, parts of speech, phonetics, and pronunciations without creating an account or installing anything. The app pulls data from a public dictionary API and keeps your history and favorites locally in the browser.

## Features

### Core lookup

- Search any English word via DictionaryAPI.dev and render its definitions and pronunciation data.
- Show phonetic transcriptions with audio playback when available.
- Group definitions by part of speech and include examples when provided by the API.
- Expand and collapse each part-of-speech section to focus on relevant meanings.

### Learning and recall

- Save favorite words with a heart toggle and persist them in `localStorage`.
- Track search history locally and re-run lookups by clicking past words.

### Navigation and feedback

- Switch between Main, History, and Favorites sections from the header menu.
- Alert on empty searches and on words that are not found.

## Tech Stack

### Frontend and UI

- HTML5 in `index.html` defines the structure, including the Main, History, and Favorites sections.
- CSS in `style.css` handles layout, typography, and interaction styling, including responsive sizing.
- Vanilla JavaScript in `main.js` manages state, event handlers, DOM rendering, and audio playback.
- Font Awesome is loaded via CDN for icons, and Google Fonts provides the "Playfair Display" typeface.

### Data and storage

- The app calls `https://api.dictionaryapi.dev/api/v2/entries/en/{word}` using the browser Fetch API.
- Pronunciation audio URLs from the API are wired into `<audio>` elements for playback.
- Search history and favorites are persisted in browser `localStorage` under the keys `History` and `Favorites`.

## Architecture / Project Structure

- `index.html` defines the UI layout and the three main sections.
- `main.js` contains the Dictionary API endpoint in `fetchInfo()` and the supported parts of speech in the `SpeechParts` array. Defines the `localStorage` keys (`History`, `Favorites`) used for persistence.
- `style.css` controls theme, layout, and responsive behavior.

## Security / Privacy Notes

- There is no authentication or server-side storage.
- Search queries are sent to DictionaryAPI.dev, and pronunciation audio is loaded from their URLs.
- History and favorites are stored locally in the browser via `localStorage`.

## Live Demo

[Open the app](https://the-dictionary-app.vercel.app/)
