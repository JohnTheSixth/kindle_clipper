import { TFile, Vault } from 'obsidian';

export interface FileReadResult {
  content: string;
  fileName: string;
}

export interface FileWriteOptions {
  overwrite?: boolean;
}

export class FileHandler {
  constructor(private vault: Vault) {}

  async readTextFile(file: TFile): Promise<FileReadResult> {
    const content = await this.vault.read(file);
    return {
      content,
      fileName: file.basename,
    };
  }

  async writeMarkdownFile(
    path: string,
    content: string,
    options: FileWriteOptions = {}
  ): Promise<TFile> {
    const { overwrite = false } = options;

    const normalizedPath = path.endsWith('.md') ? path : `${path}.md`;
    const existingFile = this.vault.getAbstractFileByPath(normalizedPath);

    if (existingFile instanceof TFile) {
      if (overwrite) {
        await this.vault.modify(existingFile, content);
        return existingFile;
      }
      throw new Error(`File already exists: ${normalizedPath}`);
    }

    return await this.vault.create(normalizedPath, content);
  }

  async generateUniqueFilePath(basePath: string): Promise<string> {
    const normalizedBase = basePath.endsWith('.md') ? basePath.slice(0, -3) : basePath;
    let path = `${normalizedBase}.md`;
    let counter = 1;

    while (this.vault.getAbstractFileByPath(path)) {
      path = `${normalizedBase} ${counter}.md`;
      counter++;
    }

    return path;
  }
}
