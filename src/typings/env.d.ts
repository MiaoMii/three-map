/**
 * Namespace Env
 *
 * It is used to declare the type of the import.meta object
 */
declare namespace Env {
  /** The router history mode */
  type RouterHistoryMode = 'hash' | 'history' | 'memory';

  interface ImportMeta extends ImportMetaEnv {
    /** The base url of the application */
    readonly VITE_BASE_URL: string;
    /** The router history mode */
    readonly VITE_ROUTER_HISTORY_MODE?: RouterHistoryMode;
  }
}

interface ImportMeta {
  readonly env: Env.ImportMeta;
}

