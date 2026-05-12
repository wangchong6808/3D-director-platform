type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_COLORS: Record<LogLevel, string> = {
  debug: '#888',
  info: '#1890ff',
  warn: '#faad14',
  error: '#ff4d4f',
};

const MODULE_COLORS: Record<string, string> = {
  SceneTree: '#52c41a',
  PropertyPanel: '#722ed1',
  Store: '#13c2c2',
  Toolbar: '#eb2f96',
  Viewport: '#fa8c16',
};

function getTimestamp(): string {
  return new Date().toISOString().split('T')[1].slice(0, 12);
}

function log(level: LogLevel, module: string, action: string, detail?: unknown) {
  const timestamp = getTimestamp();
  const moduleColor = MODULE_COLORS[module] ?? '#ccc';
  const levelColor = LOG_COLORS[level];

  const prefix = `%c[${timestamp}]%c [${module}]%c ${action}`;
  const styles = [
    `color: #666`,
    `color: ${moduleColor}; font-weight: bold`,
    `color: ${levelColor}`,
  ];

  if (detail !== undefined) {
    console.groupCollapsed(prefix, ...styles);
    console.log('%c详情:', `color: ${levelColor}`, detail);
    console.trace('%c调用栈', 'color: #666');
    console.groupEnd();
  } else {
    console.log(prefix, ...styles);
  }
}

export const logger = {
  debug: (module: string, action: string, detail?: unknown) => log('debug', module, action, detail),
  info: (module: string, action: string, detail?: unknown) => log('info', module, action, detail),
  warn: (module: string, action: string, detail?: unknown) => log('warn', module, action, detail),
  error: (module: string, action: string, detail?: unknown) => log('error', module, action, detail),
};
