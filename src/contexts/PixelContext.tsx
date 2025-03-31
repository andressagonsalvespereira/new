
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

  // Inicializa pixels no primeiro carregamento
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getPixelSettings();
        setPixelSettings(settings);
        
        // Verifica se temos configurações e se algum pixel está habilitado
        if (settings && (
          (settings.google.enabled && settings.google.tagId) || 
          (settings.facebook.enabled && settings.facebook.pixelId)
        )) {
          await initializePixels();
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Erro ao inicializar pixels:', error);
      }
    };
    
    fetchSettings();
  }, []);

  // Rastreia visualizações de página quando a localização muda
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
