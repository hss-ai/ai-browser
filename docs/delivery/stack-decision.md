# Stack Decision

- Framework: Electron 28 (vanilla JS renderer, no React/Vue)
- UI system: CSS Custom Properties (design tokens via tokens.css), CSS Grid + Flexbox
- Data access mode: JSON file-based via main/store.js with safeStorage encryption
- ORM: None — direct JSON read/write, in-memory cache with debounced persist
- Hosting: Desktop app (Electron), distributed via electron-builder (NSIS/DMG/AppImage)
- Fonts: @fontsource (Inter + JetBrains Mono, bundled)
- Search: Fuse.js (client-side fuzzy search for command palette)
- Packaging: @electron/packager (dev), electron-builder (release)
- CI/CD: GitHub Actions (.github/workflows/ci.yml + release.yml)
- i18n: Custom in-memory key-value (i18n.js, zh-CN + en-US, data-i18n attribute binding)
