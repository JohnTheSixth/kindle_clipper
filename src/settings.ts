import { App, PluginSettingTab } from 'obsidian';
import KindleClipperPlugin from './main';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface KindleClipperSettings {
  // Future settings can be added here
}

export const DEFAULT_SETTINGS: KindleClipperSettings = {};

export class KindleClipperSettingTab extends PluginSettingTab {
  plugin: KindleClipperPlugin;

  constructor(app: App, plugin: KindleClipperPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('p', {
      text: 'No configuration options available yet.',
    });
  }
}
