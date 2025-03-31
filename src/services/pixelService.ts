
import { supabase } from '@/integrations/supabase/client';

export interface PixelSettings {
  google: {
    enabled: boolean;
    tagId: string;
    events: {
      pageView: boolean;
      purchase: boolean;
    };
  };
  facebook: {
    enabled: boolean;
    pixelId: string;
    events: {
      pageView: boolean;
      addToCart: boolean;
      purchase: boolean;
    };
  };
  isInitialized?: boolean;
}

const DEFAULT_SETTINGS: PixelSettings = {
  google: {
    enabled: false,
    tagId: '',
    events: {
      pageView: false,
      purchase: false
    }
  },
  facebook: {
    enabled: false,
    pixelId: '',
    events: {
      pageView: false,
      addToCart: false,
      purchase: false
    }
  },
  isInitialized: false
};

// Obtém as configurações de pixel do Supabase
export const getPixelSettings = async (): Promise<PixelSettings> => {
  try {
    const { data, error } = await supabase
      .from('pixel_settings')
      .select('*')
      .limit(1)
      .single();
    
    if (error) {
      console.error('Erro ao obter configurações de pixel:', error);
      return DEFAULT_SETTINGS;
    }
    
    return {
      google: {
        enabled: data.google_pixel_enabled || false,
        tagId: data.google_pixel_id || '',
        events: {
          pageView: data.google_page_view || false,
          purchase: data.google_purchase || false
        }
      },
      facebook: {
        enabled: data.meta_pixel_enabled || false,
        pixelId: data.meta_pixel_id || '',
        events: {
          pageView: data.meta_page_view || false,
          addToCart: data.meta_add_to_cart || false,
          purchase: data.meta_purchase || false
        }
      }
    };
  } catch (error) {
    console.error('Erro ao obter configurações de pixel:', error);
    return DEFAULT_SETTINGS;
  }
};

// Salva as configurações de pixel no Supabase
export const savePixelSettings = async (settings: PixelSettings): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('pixel_settings')
      .update({
        google_pixel_enabled: settings.google.enabled,
        google_pixel_id: settings.google.tagId,
        google_page_view: settings.google.events.pageView,
        google_purchase: settings.google.events.purchase,
        meta_pixel_enabled: settings.facebook.enabled,
        meta_pixel_id: settings.facebook.pixelId,
        meta_page_view: settings.facebook.events.pageView,
        meta_add_to_cart: settings.facebook.events.addToCart,
        meta_purchase: settings.facebook.events.purchase
      })
      .eq('id', 1);
    
    if (error) {
      console.error('Erro ao salvar configurações de pixel:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao salvar configurações de pixel:', error);
    return false;
  }
};

// Inicializa os pixels
export const initializePixels = async (): Promise<void> => {
  try {
    const settings = await getPixelSettings();
    
    // Inicializa o Google Tag Manager (GTM)
    if (settings.google.enabled && settings.google.tagId) {
      initializeGoogleTagManager(settings.google.tagId);
    }
    
    // Inicializa o Facebook Pixel
    if (settings.facebook.enabled && settings.facebook.pixelId) {
      initializeFacebookPixel(settings.facebook.pixelId);
    }
  } catch (error) {
    console.error('Erro ao inicializar pixels:', error);
  }
};

// Rastreia visualização de página
export const trackPageView = (path: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    // Google Analytics
    if (window.gtag) {
      window.gtag('config', window.GA_TRACKING_ID, {
        page_path: path
      });
    }
    
    // Facebook Pixel
    if (window.fbq) {
      window.fbq('track', 'PageView');
    }
  } catch (error) {
    console.error('Erro ao rastrear visualização de página:', error);
  }
};

// Rastreia compra
export const trackPurchase = (orderId: string, value: number): void => {
  if (typeof window === 'undefined') return;
  
  try {
    // Google Analytics
    if (window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: orderId,
        value: value,
        currency: 'BRL'
      });
    }
    
    // Facebook Pixel
    if (window.fbq) {
      window.fbq('track', 'Purchase', {
        value: value,
        currency: 'BRL',
        content_ids: [orderId],
        content_type: 'product'
      });
    }
  } catch (error) {
    console.error('Erro ao rastrear compra:', error);
  }
};

// Rastreia adição ao carrinho
export const trackAddToCart = (productId: string, value: number): void => {
  if (typeof window === 'undefined') return;
  
  try {
    // Facebook Pixel
    if (window.fbq) {
      window.fbq('track', 'AddToCart', {
        value: value,
        currency: 'BRL',
        content_ids: [productId],
        content_type: 'product'
      });
    }
  } catch (error) {
    console.error('Erro ao rastrear adição ao carrinho:', error);
  }
};

// Inicializa o Google Tag Manager
const initializeGoogleTagManager = (id: string): void => {
  if (typeof window === 'undefined' || window.gtag) return;
  
  try {
    window.GA_TRACKING_ID = id;
    
    // Adiciona o script do GTM
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    script.async = true;
    document.head.appendChild(script);
    
    // Inicializa o GTM
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', id);
  } catch (error) {
    console.error('Erro ao inicializar Google Tag Manager:', error);
  }
};

// Inicializa o Facebook Pixel
const initializeFacebookPixel = (id: string): void => {
  if (typeof window === 'undefined' || window.fbq) return;
  
  try {
    // Adiciona o script do Facebook Pixel
    !function(f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function() {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    
    // Inicializa o pixel
    window.fbq('init', id);
    window.fbq('track', 'PageView');
  } catch (error) {
    console.error('Erro ao inicializar Facebook Pixel:', error);
  }
};
