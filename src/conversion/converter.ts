const CLIPPING_DELIMITER = '==========';

export interface ClippingMetadata {
  bookTitle: string;
  author: string;
  page?: string;
  location?: string;
  locationNumber?: number;
  dateAdded?: Date;
  dateString?: string;
  type: 'highlight' | 'note' | 'bookmark';
}

export interface Clipping {
  metadata: ClippingMetadata;
  content: string;
}

export interface ParseResult {
  clippings: Clipping[];
  errors: string[];
}

export interface ConvertOptions {
  groupByBook?: boolean;
  includeMetadata?: boolean;
}

function parseTitleAuthor(line: string): { title: string; author: string } | null {
  const match = line.match(/^(.+?) \((.+)\)$/);
  if (!match || !match[1] || !match[2]) return null;
  return { title: match[1].replace(/^\uFEFF/, ''), author: match[2] };
}

function parseMetadataLine(line: string): {
  type: 'highlight' | 'note' | 'bookmark';
  page?: string;
  location?: string;
  locationNumber?: number;
  dateString?: string;
} | null {
  const typeMatch = line.match(/^- Your (\w+)/i);
  if (!typeMatch || !typeMatch[1]) return null;

  const typeStr = typeMatch[1].toLowerCase();
  const type: 'highlight' | 'note' | 'bookmark' =
    typeStr === 'highlight' ? 'highlight' : typeStr === 'note' ? 'note' : 'bookmark';

  const parts = line.split('|').map((p) => p.trim());

  let page: string | undefined;
  let location: string | undefined;
  let locationNumber: number | undefined;
  let dateString: string | undefined;

  for (const part of parts) {
    const pageMatch = part.match(/page (\d+)/i);
    if (pageMatch) {
      page = pageMatch[1];
    }

    const locationMatch = part.match(/Location (\d+)(?:-\d+)?/i);
    if (locationMatch && locationMatch[1]) {
      location = part.replace(/^.*?(Location \d+(?:-\d+)?).*$/, '$1');
      locationNumber = parseInt(locationMatch[1], 10);
    }

    const dateMatch = part.match(/Added on (.+)$/i);
    if (dateMatch) {
      dateString = dateMatch[1];
    }
  }

  return { type, page, location, locationNumber, dateString };
}

function parseClippingBlock(block: string): Clipping | null {
  const lines = block
    .split('\n')
    .map((line) => line.replace('\r', ''))
    .filter((line) => line.trim().length > 0);

  if (lines.length < 2) return null;

  const titleLine = lines[0];
  const metadataLine = lines[1];
  const contentLines = lines.slice(2);

  if (!titleLine || !metadataLine) return null;

  const titleAuthor = parseTitleAuthor(titleLine);
  if (!titleAuthor) return null;

  const metadata = parseMetadataLine(metadataLine);
  if (!metadata) return null;

  // Skip bookmarks (they have no content)
  if (metadata.type === 'bookmark') return null;

  const content = contentLines.join('\n').trim();
  if (!content) return null;

  return {
    metadata: {
      bookTitle: titleAuthor.title,
      author: titleAuthor.author,
      type: metadata.type,
      page: metadata.page,
      location: metadata.location,
      locationNumber: metadata.locationNumber,
      dateString: metadata.dateString,
    },
    content,
  };
}

function removeDuplicates(clippings: Clipping[]): Clipping[] {
  // Group by book
  const byBook = new Map<string, Clipping[]>();
  for (const clipping of clippings) {
    const key = clipping.metadata.bookTitle;
    if (!byBook.has(key)) {
      byBook.set(key, []);
    }
    byBook.get(key)!.push(clipping);
  }

  const result: Clipping[] = [];

  for (const bookClippings of byBook.values()) {
    // For each clipping, check if it's a substring of another
    const filtered = bookClippings.filter((clipping, index) => {
      const content = clipping.content;
      // Check if any OTHER clipping contains this one
      for (let i = 0; i < bookClippings.length; i++) {
        if (i === index) continue;
        const otherClipping = bookClippings[i];
        if (!otherClipping) continue;
        const other = otherClipping.content;
        // If this content is a proper substring of another, filter it out
        if (other.includes(content) && other !== content) {
          return false;
        }
      }
      return true;
    });
    result.push(...filtered);
  }

  return result;
}

function sortByLocation(clippings: Clipping[]): Clipping[] {
  return [...clippings].sort((a, b) => {
    // First sort by book title
    const titleCompare = a.metadata.bookTitle.localeCompare(b.metadata.bookTitle);
    if (titleCompare !== 0) return titleCompare;

    // Then by location number
    const locA = a.metadata.locationNumber ?? 0;
    const locB = b.metadata.locationNumber ?? 0;
    return locA - locB;
  });
}

export class ClippingsConverter {
  parse(rawText: string): ParseResult {
    const errors: string[] = [];
    const blocks = rawText.split(CLIPPING_DELIMITER);

    const clippings: Clipping[] = [];

    for (let i = 0; i < blocks.length; i++) {
      const rawBlock = blocks[i];
      if (!rawBlock) continue;
      const block = rawBlock.trim();
      if (!block) continue;

      try {
        const clipping = parseClippingBlock(block);
        if (clipping) {
          clippings.push(clipping);
        }
      } catch (e) {
        errors.push(`Failed to parse clipping block ${i + 1}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    // Remove duplicates and sort by location
    const deduplicated = removeDuplicates(clippings);
    const sorted = sortByLocation(deduplicated);

    return { clippings: sorted, errors };
  }

  toMarkdown(clippings: Clipping[], options: ConvertOptions = {}): string {
    const { groupByBook = true } = options;

    if (!groupByBook) {
      return clippings.map((c) => this.formatClipping(c)).join('\n\n');
    }

    // Group by book
    const byBook = new Map<string, { author: string; clippings: Clipping[] }>();
    for (const clipping of clippings) {
      const key = clipping.metadata.bookTitle;
      if (!byBook.has(key)) {
        byBook.set(key, { author: clipping.metadata.author, clippings: [] });
      }
      byBook.get(key)!.clippings.push(clipping);
    }

    const sections: string[] = [];
    for (const [title, { author, clippings: bookClippings }] of byBook) {
      const header = `# ${title}\n\n## ${author}`;
      const content = bookClippings.map((c) => this.formatClipping(c)).join('\n\n');
      sections.push(`${header}\n\n${content}`);
    }

    return sections.join('\n\n---\n\n');
  }

  private formatClipping(clipping: Clipping): string {
    const { metadata, content } = clipping;

    // Build metadata line
    const parts: string[] = [];

    if (metadata.type === 'note') {
      parts.push('Note');
    }

    if (metadata.page) {
      parts.push(`Page ${metadata.page}`);
    }

    if (metadata.location) {
      parts.push(metadata.location);
    }

    if (metadata.dateString) {
      parts.push(metadata.dateString);
    }

    const metadataLine = parts.join(', ') + ':';

    // Format content based on type
    if (metadata.type === 'highlight') {
      return `${metadataLine}\n\n> ${content}`;
    } else {
      // Notes are plain text
      return `${metadataLine}\n\n${content}`;
    }
  }
}
