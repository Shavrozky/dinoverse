// Minimal dev-server launcher that avoids MSYS TTY issues on this host.
import { spawn } from 'node:child_process';
import path from 'node:path';

const viteBin = path.resolve('node_modules/vite/bin/vite.js');
const child = spawn(process.execPath, [viteBin, '--port', '3100', '--strictPort'], {
  stdio: 'inherit',
  env: { ...process.env, FORCE_COLOR: '0' },
});

child.on('exit', (code) => process.exit(code ?? 0));
