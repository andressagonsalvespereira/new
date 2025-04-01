
import { DeviceType } from '@/types/order';

/**
 * Detects the current device type (mobile or desktop)
 * @returns The detected device type
 */
export const detectDeviceType = (): DeviceType => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
    ? 'mobile' 
    : 'desktop';
};
