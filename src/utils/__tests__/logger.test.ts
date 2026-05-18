import { describe, it, expect, beforeEach, vi } from 'vitest';
import { logger, getLastLogMessage } from '../logger';

describe('LOG: logger', () => {
  beforeEach(() => {
    logger.setLevel('debug');
  });

  it('LOG-001: info级别日志', () => {
    logger.info('test message');
    expect(getLastLogMessage()).toContain('test message');
  });

  it('LOG-002: warn级别日志', () => {
    logger.setLevel('debug');
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    logger.warn('warning');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('LOG-003: error级别日志', () => {
    logger.setLevel('debug');
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    logger.error('error msg');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('LOG-004: debug级别日志', () => {
    logger.setLevel('debug');
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    logger.debug('debug msg');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('LOG-006: 日志级别过滤', () => {
    logger.setLevel('warn');
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    logger.info('should not appear');
    logger.debug('should not appear');
    logger.warn('should appear');
    expect(spy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();
    spy.mockRestore();
    warnSpy.mockRestore();
  });

  it('LOG-007: 多参数日志', () => {
    logger.info('a', 'b', 'c');
    expect(getLastLogMessage()).toBe('a b c');
  });

  it('LOG-008: 空消息不报错', () => {
    expect(() => logger.info('')).not.toThrow();
  });

  it('getLastLogMessage返回最新日志', () => {
    logger.info('first');
    logger.info('second');
    expect(getLastLogMessage()).toBe('second');
  });
});