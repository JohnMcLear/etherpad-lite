// admin/scripts/gen-api.mjs
//
// Regenerates admin/src/api/schema.d.ts from the live OpenAPI spec exported
// by src/node/hooks/express/openapi.ts. Run via `pnpm --filter admin gen:api`.

import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const adminRoot = path.resolve(here, '..');
const outFile = path.join(adminRoot, 'src', 'api', 'schema.d.ts');

const tmpDir = mkdtempSync(path.join(tmpdir(), 'etherpad-openapi-'));
const specPath = path.join(tmpDir, 'spec.json');

try {
  const dump = spawnSync(
    'pnpm',
    ['exec', 'tsx', 'scripts/dump-spec.ts', specPath],
    { cwd: adminRoot, stdio: 'inherit' },
  );
  if (dump.status !== 0) {
    console.error(`dump-spec.ts failed with exit code ${dump.status}`);
    process.exit(dump.status ?? 1);
  }

  const gen = spawnSync(
    'pnpm',
    ['exec', 'openapi-typescript', specPath, '-o', outFile],
    { cwd: adminRoot, stdio: 'inherit' },
  );
  if (gen.status !== 0) {
    console.error(`openapi-typescript failed with exit code ${gen.status}`);
    process.exit(gen.status ?? 1);
  }

  const header =
    `// GENERATED — do not edit. Run \`pnpm --filter admin gen:api\` to regenerate.\n` +
    `// Source: src/node/hooks/express/openapi.ts (#7638)\n\n`;
  const body = readFileSync(outFile, 'utf8');
  writeFileSync(outFile, header + body, 'utf8');

  console.log(`Wrote ${path.relative(process.cwd(), outFile)}`);
} finally {
  rmSync(tmpDir, { recursive: true, force: true });
}
