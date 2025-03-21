/**
 * 日志工具 - 在开发环境打印日志，生产环境不打印
 */

// 检测打印标志 - 可以通过构建时的环境变量控制
// 为简化实现，我们提供一个全局变量来控制
const DEBUG_MODE = false; // 设置为true开启调试日志，发布前设置为false

/**
 * 日志工具类
 */
export class Logger {
  /**
   * 输出普通日志
   * @param args 日志参数
   */
  static log(...args: any[]): void {
    if (DEBUG_MODE) {
      console.log('[Upwork Assistant]', ...args);
    }
  }

  /**
   * 输出信息日志
   * @param args 日志参数
   */
  static info(...args: any[]): void {
    if (DEBUG_MODE) {
      console.info('[Upwork Assistant]', ...args);
    }
  }

  /**
   * 输出警告日志
   * @param args 日志参数
   */
  static warn(...args: any[]): void {
    if (DEBUG_MODE) {
      console.warn('[Upwork Assistant]', ...args);
    }
  }

  /**
   * 输出错误日志
   * @param args 日志参数
   */
  static error(...args: any[]): void {
    if (DEBUG_MODE) {
      console.error('[Upwork Assistant]', ...args);
    }
  }

  /**
   * 输出调试日志
   * @param args 日志参数
   */
  static debug(...args: any[]): void {
    if (DEBUG_MODE) {
      console.debug('[Upwork Assistant]', ...args);
    }
  }
}

export default Logger;