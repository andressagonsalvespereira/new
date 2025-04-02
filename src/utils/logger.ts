/**
 * Utilitário de logging para centralizar e padronizar logs da aplicação
 * Controla exibição de logs baseado em ambiente de desenvolvimento
 */

const isDev = import.meta.env.MODE === 'development';

export const logger = {
  /**
   * Log genérico (também pode ser usado como info)
   */
  log: (message: string, data?: any) => {
    if (isDev) {
      if (data) {
        console.log(`[LOG] ${message}`, data);
      } else {
        console.log(`[LOG] ${message}`);
      }
    }
  },

  /**
   * Log informativo (alias do log, para manter semântica)
   */
  info: (message: string, data?: any) => {
    if (isDev) {
      if (data) {
        console.info(`[INFO] ${message}`, data);
      } else {
        console.info(`[INFO] ${message}`);
      }
    }
  },

  /**
   * Log de aviso
   */
  warn: (message: string, data?: any) => {
    if (isDev) {
      if (data) {
        console.warn(`[WARN] ${message}`, data);
      } else {
        console.warn(`[WARN] ${message}`);
      }
    }
  },

  /**
   * Log de erro (exibido mesmo fora do dev)
   */
  error: (message: string, error?: any) => {
    if (error) {
      console.error(`[ERROR] ${message}`, error);
    } else {
      console.error(`[ERROR] ${message}`);
    }
  }
};
