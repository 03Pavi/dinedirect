# dinein

A modern Next.js project template built using **Feature-Sliced Design (FSD)** architecture.

## Architecture Structure

This project follows the FSD architecture style:
- **src/app**: App-wide setup, providers, styles, layouts, and page routing definitions.
- **src/pages**: Page-level containers (e.g., `home-page`, `chat-page`).
- **src/widgets**: Composite UI blocks (e.g., `chat-box`, `switch-language`).
- **src/entities**: Domain state management and entities (e.g., `user` Redux slice).
- **src/shared**: Reusable UI parts, custom hooks, API setups, and translations.

## Configured Features

- **Firebase**: Configured with initialization templates and authentication setup.
- **PWA Support**: Service worker and Progressive Web App manifest configured.
- **Translation Library**: Integrated utilizing `i18n`.

## Next Steps

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run development servers:
   - Start Next.js local application:
     ```bash
     npm run dev
     ```

