# Kindle Clipper

An Obsidian plugin for viewing text files and converting Kindle highlights into organized markdown notes.

## Features

### Available now
- **Native TXT file viewing** - View `.txt` files directly in Obsidian instead of opening them in an external app

### Planned
- **Kindle clippings import** - Convert Kindle's `My Clippings.txt` into Obsidian markdown files, one note per book
- **Custom text file conversion** - Support for non-Kindle text formats (based on community requests)

## Installation

### From Obsidian (coming soon)
1. Open Settings → Community plugins
2. Search for "Kindle Clipper"
3. Install and enable

### Manual installation
1. Download `main.js`, `styles.css`, and `manifest.json` from the latest release
2. Create folder: `<vault>/.obsidian/plugins/kindle-clipper/`
3. Copy the files into that folder
4. Enable the plugin in Settings → Community plugins

## Development

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Development mode (watch)
npm run dev

# Lint
npm run lint

# Format code
npm run format
```

## Project structure

```
src/
  main.ts              # Plugin entry point
  settings.ts          # Settings tab
  constants.ts         # Shared constants
  views/
    TxtFileView.ts     # Custom view for .txt files
```

## Contributing

Special thanks to [kkincade](http://github.com/kkincade) for his work on [kindle-clippings-to-markdown](https://github.com/kkincade/kindle-clippings-to-markdown), which was the inspiration for this library.

Additional issues and PRs welcome. For feature requests, please open an issue first to discuss.

## License

0-BSD
