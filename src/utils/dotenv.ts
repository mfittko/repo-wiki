import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileExists } from './fs.js';

export type DotEnvLoadResult = {
  path: string;
  loaded: boolean;
  keys: string[];
};

export async function loadDotEnv(cwd = process.cwd(), fileName = '.env'): Promise<DotEnvLoadResult> {
  const envPath = path.join(path.resolve(cwd), fileName);
  if (!await fileExists(envPath)) {
    return { path: envPath, loaded: false, keys: [] };
  }

  const content = await fs.readFile(envPath, 'utf8');
  const parsed = parseDotEnv(content);
  const keys: string[] = [];

  for (const [key, value] of Object.entries(parsed)) {
    if (process.env[key] === undefined) {
      process.env[key] = value;
      keys.push(key);
    }
  }

  return { path: envPath, loaded: true, keys: keys.sort() };
}

export function parseDotEnv(content: string): Record<string, string> {
  const values: Record<string, string> = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const withoutExport = line.startsWith('export ') ? line.slice('export '.length).trimStart() : line;
    const equalsIndex = withoutExport.indexOf('=');
    if (equalsIndex <= 0) {
      continue;
    }

    const key = withoutExport.slice(0, equalsIndex).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
      continue;
    }

    values[key] = parseDotEnvValue(withoutExport.slice(equalsIndex + 1).trim());
  }

  return values;
}

function parseDotEnvValue(rawValue: string): string {
  if (rawValue.startsWith('"')) {
    const end = findClosingQuote(rawValue, '"');
    const quoted = end === -1 ? rawValue.slice(1) : rawValue.slice(1, end);
    return quoted
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\');
  }

  if (rawValue.startsWith("'")) {
    const end = findClosingQuote(rawValue, "'");
    return end === -1 ? rawValue.slice(1) : rawValue.slice(1, end);
  }

  return stripInlineComment(rawValue).trim();
}

function findClosingQuote(value: string, quote: string): number {
  for (let i = 1; i < value.length; i += 1) {
    if (value[i] === quote && value[i - 1] !== '\\') {
      return i;
    }
  }
  return -1;
}

function stripInlineComment(value: string): string {
  for (let i = 0; i < value.length; i += 1) {
    if (value[i] === '#' && (i === 0 || /\s/.test(value[i - 1]))) {
      return value.slice(0, i);
    }
  }
  return value;
}
