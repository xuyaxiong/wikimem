import { basename, extname } from 'node:path';
import { readTextFile } from '../core/file-encoding.js';

export interface ProcessedText {
  title: string;
  content: string;
  wordCount: number;
}

export function processText(filePath: string): ProcessedText {
  const content = readTextFile(filePath);
  const title = basename(filePath, extname(filePath));
  const wordCount = content.split(/\s+/).filter(Boolean).length;

  return { title, content, wordCount };
}
