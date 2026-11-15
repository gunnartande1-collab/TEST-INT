'use strict';

const { execFileSync } = require('node:child_process');
const { readFileSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');

const repository = 'https://github.com/gunnartande1-collab/Intensiv--og-helikoptertransport.git';
const root = join(__dirname, '..');
const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8', timeout: 20000 }).trim();
const commit = process.env.CF_PAGES_COMMIT_SHA || git(['rev-parse', 'HEAD']);

if (!/^[0-9a-f]{40}$/.test(commit)) {
  throw new Error('Finner ikke en gyldig commit-ID for OPSIX-bygget.');
}

const tagPattern = /^refs\/tags\/v\.?((?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*))(?:\^\{\})?$/;
const matchingVersions = new Set();

let tagList;
try {
  tagList = git(['ls-remote', '--tags', repository]);
} catch {
  console.warn('OPSIX: Kunne ikke hente versjonstagger fra GitHub.');
}

for (const line of (tagList || '').split('\n')) {
  const [sha, ref = ''] = line.split('\t');
  if (sha !== commit) continue;
  const match = ref.match(tagPattern);
  if (match) matchingVersions.add(match[1]);
}

const [version] = [...matchingVersions].sort((a, b) => b.localeCompare(a, 'en', { numeric: true }));
const label = version || (tagList === undefined ? 'Versjon ukjent' : 'TEST') + ' (' + commit.slice(0, 7) + ')';
const htmlPath = join(root, 'index.html');
const html = readFileSync(htmlPath, 'utf8');
const versionElement = /<span id="currentVersion"(?: data-version="[^"]*")?>[^<]*<\/span>/g;

if ([...html.matchAll(versionElement)].length !== 1) {
  throw new Error('Forventet ett versjonsfelt med id="currentVersion" i intensiv/index.html.');
}

const attribute = version ? ' data-version="v' + version + '"' : '';
writeFileSync(htmlPath, html.replace(versionElement, '<span id="currentVersion"' + attribute + '>' + label + '</span>'), 'utf8');
