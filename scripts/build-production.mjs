import { spawnSync } from 'node:child_process';
import path from 'node:path';

const bin = (name) => path.join(
  process.cwd(),
  'node_modules',
  '.bin',
  process.platform === 'win32' ? name + '.cmd' : name
);

const env = {
  ...process.env,
  // Hostinger web-app builds can run under a strict process/thread quota.
  // Tailwind CSS v4's native Oxide engine uses Rayon and otherwise derives
  // its worker count from available CPUs. Keep production builds predictable
  // on constrained shared hosting while allowing an explicit override.
  RAYON_NUM_THREADS: process.env.RAYON_NUM_THREADS || '1'
};

const run = (command, args) => {
  const result = spawnSync(command, args, { stdio: 'inherit', env });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

run(bin('vite'), ['build']);
run(bin('esbuild'), [
  'server.ts',
  '--bundle',
  '--platform=node',
  '--format=cjs',
  '--packages=external',
  '--outfile=dist/server.cjs'
]);
run(process.execPath, ['scripts/copy-postgres-migrations.mjs']);
