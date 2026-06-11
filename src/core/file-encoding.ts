import { readFileSync } from 'node:fs';
import iconv from 'iconv-lite';

/**
 * Read a text file with automatic encoding detection.
 * Tries UTF-8 first; falls back to GBK (common Chinese ANSI encoding on Windows)
 * if the file contains invalid UTF-8 sequences.
 */
export function readTextFile(filePath: string): string {
  const buf = readFileSync(filePath);

  // Try UTF-8 first
  const utf8 = iconv.decode(buf, 'utf-8');
  if (!containsReplacement(utf8)) return utf8;

  // Fallback: try GBK (Chinese Windows ANSI)
  try {
    return iconv.decode(buf, 'gbk');
  } catch {
    // Last resort: return the raw buffer as latin1 (no data loss, just potentially garbled)
    return iconv.decode(buf, 'latin1');
  }
}

function containsReplacement(text: string): boolean {
  return text.includes('\uFFFD');
}
