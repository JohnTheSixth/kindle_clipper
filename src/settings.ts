import { App, PluginSettingTab } from "obsidian";
import KindleClipperPlugin from "./main";

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

		containerEl.createEl("h2", { text: "Kindle Clipper settings" });
		containerEl.createEl("p", {
			text: "No configuration options available yet.",
		});
	}
}
