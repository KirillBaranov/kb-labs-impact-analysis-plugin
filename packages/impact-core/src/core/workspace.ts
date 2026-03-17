import { existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { SubRepo } from '@kb-labs/impact-contracts';

const CATEGORIES = ['platform', 'plugins', 'infra', 'templates'] as const;

export function findWorkspaceRoot(cwd?: string): string {
  let dir = resolve(cwd ?? process.cwd());
  for (let i = 0; i < 10; i++) {
    if (existsSync(join(dir, '.gitmodules')) || existsSync(join(dir, '.kb', 'kb.config.json'))) {
      return dir;
    }
    const parent = resolve(dir, '..');
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error('Could not find workspace root (no .gitmodules or .kb/kb.config.json found)');
}

export function listSubRepos(workspaceRoot: string): SubRepo[] {
  const repos: SubRepo[] = [];
  for (const category of CATEGORIES) {
    const categoryDir = join(workspaceRoot, category);
    if (!existsSync(categoryDir)) continue;
    for (const entry of readdirSync(categoryDir, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
      const repoPath = `${category}/${entry.name}`;
      const fullPath = join(workspaceRoot, repoPath);
      if (existsSync(join(fullPath, '.git')) || existsSync(join(fullPath, 'package.json'))) {
        repos.push({ path: repoPath, category, name: entry.name });
      }
    }
  }
  return repos;
}
