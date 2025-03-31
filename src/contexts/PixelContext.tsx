
import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  initializePixels, 
  trackPageView,
  getPixelSettings,
  PixelSettings
} from '@/services/pixelService';

interface PixelContextType {
  pixelSettings: PixelSettings | null;
  isInitialized: boolean;
}

const PixelContext = createContext<PixelContextType>({
  pixelSettings: null,
  isInitialized: false
});

export const usePixel = () => useContext(PixelContext);

interface PixelProviderProps {
  children: ReactNode;
}

export const PixelProvider: React.FC<PixelProviderProps> = ({ children }) => {
  const location = useLocation();
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [pixelSettings, setPixelSettings] = React.useState<PixelSettings | null>(null);

  // Initialize pixels on first load
  useEffect(() => {
    const settings = getPixelSettings();
    setPixelSettings(settings);
    
    // Check if we have settings and if any pixel is enabled
    if (settings && (
      (settings.google.enabled && settings.google.tagId) || 
      (settings.facebook.enabled && settings.facebook.pixelId)
    )) {
      initializePixels();
      setIsInitialized(true);
    }
  }, []);

  // Track page views when the location changes
  useEffect(() => {
    if (isInitialized) {
      trackPageView(location.pathname);
    }
  }, [location.pathname, isInitialized]);

  return (
    <PixelContext.Provider value={{ pixelSettings, isInitialized }}>
      {children}
    </PixelContext.Provider>
  );
};

export default PixelProvider;
