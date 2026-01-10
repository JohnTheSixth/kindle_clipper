import { TextFileView, WorkspaceLeaf } from 'obsidian';
import { TXT_VIEW_TYPE } from '../constants';

export class TxtFileView extends TextFileView {
  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  getViewType(): string {
    return TXT_VIEW_TYPE;
  }

  getDisplayText(): string {
    return this.file?.basename ?? 'Text file';
  }

  setViewData(data: string, clear: boolean): void {
    this.data = data;
    if (clear) {
      this.clear();
    }
    const preEl = this.contentEl.createEl('pre', {
      cls: 'txt-file-view-content',
    });
    preEl.textContent = data;
  }

  getViewData(): string {
    return this.data;
  }

  clear(): void {
    this.contentEl.empty();
  }
}
