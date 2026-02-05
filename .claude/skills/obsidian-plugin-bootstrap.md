# Obsidian Plugin Bootstrap

This skill creates a new Obsidian plugin project from the official template.

## Usage

```
/obsidian-plugin-bootstrap <plugin-name> [target-directory]
```

## Arguments

- `<plugin-name>` (required): The name of your new plugin (e.g., "my-awesome-plugin")
- `[target-directory]` (optional): Where to create the plugin. Defaults to `./<plugin-name>`

## Instructions

When the user invokes this skill, perform the following steps:

### 1. Parse Arguments

Extract the plugin name from the arguments. If no plugin name is provided, ask the user for one.

### 2. Clone the Obsidian Plugin Template

Clone the official Obsidian sample plugin template:

```bash
git clone --depth 1 https://github.com/obsidianmd/obsidian-sample-plugin.git <target-directory>
```

Remove the `.git` directory to start fresh:

```bash
rm -rf <target-directory>/.git
```

### 3. Prompt for Package Details

Ask the user for the following information to customize the plugin:

- **Plugin ID**: A unique identifier for the plugin (kebab-case, e.g., "my-awesome-plugin")
- **Plugin Name**: The display name shown in Obsidian (e.g., "My Awesome Plugin")
- **Description**: A brief description of what the plugin does
- **Author**: The author's name
- **Author URL** (optional): A link to the author's website or GitHub profile
- **Version**: Initial version (default: "1.0.0")
- **Minimum Obsidian Version** (optional): Minimum required Obsidian version (default: "1.4.0")

### 4. Create package.json

Create a new `package.json` file with the user's information:

```json
{
  "name": "<plugin-id>",
  "version": "<version>",
  "description": "<description>",
  "main": "main.js",
  "type": "module",
  "scripts": {
    "dev": "node esbuild.config.mjs",
    "build": "tsc -noEmit -skipLibCheck && node esbuild.config.mjs production",
    "version": "node version-bump.mjs && git add manifest.json versions.json",
    "lint": "eslint .",
    "format": "prettier --write \"src/**/*.ts\"",
    "format:check": "prettier --check \"src/**/*.ts\""
  },
  "keywords": [
    "obsidian",
    "obsidian-plugin"
  ],
  "author": "<author>",
  "license": "MIT",
  "devDependencies": {
    "@types/node": "^16.11.6",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "builtin-modules": "3.3.0",
    "esbuild": "0.25.0",
    "eslint": "^8.45.0",
    "obsidian": "latest",
    "prettier": "^3.0.0",
    "tslib": "2.4.0",
    "typescript": "5.4.5"
  }
}
```

### 5. Update manifest.json

Update the `manifest.json` file with the plugin metadata:

```json
{
  "id": "<plugin-id>",
  "name": "<plugin-name>",
  "version": "<version>",
  "minAppVersion": "<min-obsidian-version>",
  "description": "<description>",
  "author": "<author>",
  "authorUrl": "<author-url>",
  "isDesktopOnly": false
}
```

### 6. Update versions.json

Create or update `versions.json` to track version compatibility:

```json
{
  "<version>": "<min-obsidian-version>"
}
```

### 7. Initialize Git Repository

Initialize a fresh git repository:

```bash
cd <target-directory>
git init
git add .
git commit -m "Initial commit: Bootstrap Obsidian plugin from template"
```

### 8. Install Dependencies

Ask the user if they want to install npm dependencies:

```bash
npm install
```

### 9. Summary

After completion, display a summary:

```
Successfully created Obsidian plugin: <plugin-name>

Location: <target-directory>

Next steps:
1. cd <target-directory>
2. npm run dev (starts development with hot reload)
3. Link or copy the plugin folder to your vault's .obsidian/plugins/ directory
4. Enable the plugin in Obsidian Settings > Community Plugins
5. Start coding in src/main.ts

Useful commands:
- npm run dev     : Start development build with watch mode
- npm run build   : Build for production
- npm run lint    : Run ESLint
- npm run format  : Format code with Prettier
```

## Notes

- The template includes TypeScript, ESLint, and Prettier configurations
- The main plugin entry point is `src/main.ts`
- Hot reload works when the plugin folder is in your vault's plugins directory
- See https://docs.obsidian.md/Plugins for official documentation
