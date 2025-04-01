
import { DeviceType } from '@/types/order';

/**
 * Detects the device type based on the user agent
 * @returns 'mobile' | 'desktop'
 */
export const detectDeviceType = (): DeviceType => {
  const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  
  return isMobileDevice ? 'mobile' : 'desktop';
};
