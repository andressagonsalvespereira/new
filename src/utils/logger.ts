
/**
 * Utility for conditional logging based on environment
 */
export const logger = {
  log: (message: string, data?: any) => {
    if (import.meta.env.MODE === 'development') {
      if (data) {
        console.log(`[DEBUG] ${message}`, data);
      } else {
        console.log(`[DEBUG] ${message}`);
      }
    }
  },
  
  error: (message: string, error?: any) => {
    if (import.meta.env.MODE === 'development') {
      if (error) {
        console.error(`[ERROR] ${message}`, error);
      } else {
        console.error(`[ERROR] ${message}`);
      }
    }
  },
  
  warn: (message: string, data?: any) => {
    if (import.meta.env.MODE === 'development') {
      if (data) {
        console.warn(`[WARN] ${message}`, data);
      } else {
        console.warn(`[WARN] ${message}`);
      }
    }
  }
};
