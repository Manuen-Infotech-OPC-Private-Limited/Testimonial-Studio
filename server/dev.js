import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const children = [];
let shuttingDown = false;

function startChild(args) {
  const child = spawn(process.execPath, args, {
    cwd: ROOT_DIR,
    stdio: 'inherit',
  });

  child.on('exit', (code) => {
    if (!shuttingDown) {
      shuttingDown = true;
      for (const proc of children) {
        if (proc !== child && !proc.killed) {
          proc.kill();
        }
      }
      process.exit(code ?? 0);
    }
  });

  children.push(child);
  return child;
}

function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) {
      child.kill();
    }
  }
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startChild(['--watch', '--watch-path=server', path.join(ROOT_DIR, 'server', 'index.js')]);
startChild([path.join(ROOT_DIR, 'node_modules', 'vite', 'bin', 'vite.js')]);

