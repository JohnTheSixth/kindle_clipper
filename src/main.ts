import { Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, KindleClipperSettings, KindleClipperSettingTab } from './settings';
import { TxtFileView } from './views/TxtFileView';
import { TXT_VIEW_TYPE } from './constants';

export default class KindleClipperPlugin extends Plugin {
  settings: KindleClipperSettings;

  async onload() {
    await this.loadSettings();

    this.registerView(TXT_VIEW_TYPE, (leaf) => new TxtFileView(leaf));

    this.registerExtensions(['txt'], TXT_VIEW_TYPE);

    this.addSettingTab(new KindleClipperSettingTab(this.app, this));
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, (await this.loadData()) as Partial<KindleClipperSettings>);
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
