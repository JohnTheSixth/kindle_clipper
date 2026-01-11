import { App, Notice, TextFileView, WorkspaceLeaf } from 'obsidian';
import { TXT_VIEW_TYPE } from '../constants';
import { ClippingsConverter, Clipping } from '../conversion';

function sanitizeFilename(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, '-').trim();
}

export class TxtFileView extends TextFileView {
  constructor(
    leaf: WorkspaceLeaf,
    private appRef: App
  ) {
    super(leaf);
  }

  onload(): void {
    this.addAction('import', 'Import Clippings', () => this.handleImport());
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

  private async handleImport(): Promise<void> {
    if (!this.file) {
      new Notice('No file loaded');
      return;
    }

    const converter = new ClippingsConverter();
    const result = converter.parse(this.data);

    if (result.clippings.length === 0) {
      new Notice('No clippings found in file');
      return;
    }

    // Group clippings by book
    const byBook = new Map<string, { author: string; clippings: Clipping[] }>();
    for (const clipping of result.clippings) {
      const key = clipping.metadata.bookTitle;
      if (!byBook.has(key)) {
        byBook.set(key, { author: clipping.metadata.author, clippings: [] });
      }
      byBook.get(key)!.clippings.push(clipping);
    }

    // Get the folder path of the current file
    const folderPath = this.file.parent?.path ?? '';

    let filesCreated = 0;

    for (const [title, { author, clippings }] of byBook) {
      const sanitizedTitle = sanitizeFilename(title);
      const basePath = folderPath ? `${folderPath}/${sanitizedTitle}` : sanitizedTitle;

      // Generate markdown for this book's clippings
      const markdown = this.generateBookMarkdown(title, author, clippings, converter);

      // Find a unique filename
      const filePath = await this.generateUniqueFilePath(basePath);

      try {
        await this.appRef.vault.create(filePath, markdown);
        filesCreated++;
      } catch (e) {
        new Notice(`Failed to create file for "${title}": ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    if (result.errors.length > 0) {
      new Notice(`Created ${filesCreated} files with ${result.errors.length} parsing errors`);
    } else {
      new Notice(`Successfully created ${filesCreated} book files`);
    }
  }

  private generateBookMarkdown(
    title: string,
    author: string,
    clippings: Clipping[],
    converter: ClippingsConverter
  ): string {
    const header = `# ${title}\n\n## ${author}`;
    const content = converter.toMarkdown(clippings, { groupByBook: false });
    return `${header}\n\n${content}`;
  }

  private async generateUniqueFilePath(basePath: string): Promise<string> {
    const normalizedBase = basePath.endsWith('.md') ? basePath.slice(0, -3) : basePath;
    let path = `${normalizedBase}.md`;
    let counter = 1;

    while (this.appRef.vault.getAbstractFileByPath(path)) {
      path = `${normalizedBase} ${counter}.md`;
      counter++;
    }

    return path;
  }
}
