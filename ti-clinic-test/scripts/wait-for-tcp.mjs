import net from 'node:net';

const host = process.argv[2];
const port = Number(process.argv[3]);

if (!host || !Number.isFinite(port)) {
  console.error('Usage: node scripts/wait-for-tcp.mjs <host> <port>');
  process.exit(1);
}

const timeoutMs = Number(process.env.WAIT_FOR_TCP_TIMEOUT_MS ?? 60000);
const intervalMs = Number(process.env.WAIT_FOR_TCP_INTERVAL_MS ?? 500);

const startedAt = Date.now();

function tryConnect() {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(2000);

    const done = (ok) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(ok);
    };

    socket.on('connect', () => done(true));
    socket.on('timeout', () => done(false));
    socket.on('error', () => done(false));

    socket.connect(port, host);
  });
}

while (Date.now() - startedAt < timeoutMs) {
  // eslint-disable-next-line no-await-in-loop
  const ok = await tryConnect();
  if (ok) {
    process.exit(0);
  }
  // eslint-disable-next-line no-await-in-loop
  await new Promise((r) => setTimeout(r, intervalMs));
}

console.error(`Timed out waiting for tcp://${host}:${port}`);
process.exit(1);

