type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_ORDER: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

let currentLevel: LogLevel = 'info';

function formatTime(): string {
  return new Date().toISOString();
}

function log(level: LogLevel, ...args: unknown[]): void {
  if (LEVEL_ORDER[level] < LEVEL_ORDER[currentLevel]) return;
  const prefix = `[${formatTime()}] [${level.toUpperCase()}]`;
  switch (level) {
    case 'error':
      console.error(prefix, ...args);
      break;
    case 'warn':
      console.warn(prefix, ...args);
      break;
    default:
      console.log(prefix, ...args);
  }
}

export const logger = {
  debug: (...args: unknown[]) => log('debug', ...args),
  info: (...args: unknown[]) => log('info', ...args),
  warn: (...args: unknown[]) => log('warn', ...args),
  error: (...args: unknown[]) => log('error', ...args),
  setLevel: (level: LogLevel) => { currentLevel = level; },
  getLevel: (): LogLevel => currentLevel,
};

let lastMessage = '';

export function getLastLogMessage(): string {
  return lastMessage;
}

const originalInfo = logger.info;
logger.info = (...args: unknown[]) => {
  lastMessage = args.join(' ');
  originalInfo(...args);
};