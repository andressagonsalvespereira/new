
// Define types for pixel settings
export interface CustomEvent {
  id: string;
  name: string;
  trigger: string;
  enabled: boolean;
}

export interface GooglePixelSettings {
  enabled: boolean;
  tagId: string;
  events: {
    pageView: boolean;
    purchase: boolean;
  };
  customEvents: CustomEvent[];
}

export interface FacebookPixelSettings {
  enabled: boolean;
  pixelId: string;
  events: {
    pageView: boolean;
    addToCart: boolean;
    purchase: boolean;
  };
  customEvents: CustomEvent[];
}

export interface PixelSettings {
  google: GooglePixelSettings;
  facebook: FacebookPixelSettings;
}

// Load pixel settings from localStorage
export const getPixelSettings = (): PixelSettings | null => {
  try {
    const savedSettings = localStorage.getItem('pixelSettings');
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
    return null;
  } catch (error) {
    console.error('Error loading pixel settings:', error);
    return null;
  }
};

// Save pixel settings to localStorage
export const savePixelSettings = (settings: PixelSettings): boolean => {
  try {
    localStorage.setItem('pixelSettings', JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving pixel settings:', error);
    return false;
  }
};

// Initialize Google Tag Manager
export const initGoogleTagManager = (tagId: string): void => {
  if (!tagId) return;
  
  try {
    // Add Google Tag Manager script
    const script = document.createElement('script');
    script.innerHTML = `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${tagId}');
    `;
    document.head.appendChild(script);
    
    // Create dataLayer if it doesn't exist
    window.dataLayer = window.dataLayer || [];
    
    // Optional: Initialize with a PageView event
    window.dataLayer.push({
      event: 'gtm.js',
      'gtm.start': new Date().getTime(),
      'gtm.uniqueEventId': 1
    });
    
    console.log('Google Tag Manager initialized with ID:', tagId);
  } catch (error) {
    console.error('Error initializing Google Tag Manager:', error);
  }
};

// Initialize Facebook Pixel
export const initFacebookPixel = (pixelId: string): void => {
  if (!pixelId) return;
  
  try {
    // Add Facebook Pixel script
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
    
    // Initialize pixel
    window.fbq('init', pixelId);
    console.log('Facebook Pixel initialized with ID:', pixelId);
  } catch (error) {
    console.error('Error initializing Facebook Pixel:', error);
  }
};

// Send event to Google Tag Manager
export const sendGoogleEvent = (eventName: string, eventData?: Record<string, any>): void => {
  if (!window.dataLayer) return;
  
  try {
    window.dataLayer.push({
      event: eventName,
      ...eventData
    });
    console.log('Google event sent:', eventName, eventData);
  } catch (error) {
    console.error('Error sending Google event:', error);
  }
};

// Send event to Facebook Pixel
export const sendFacebookEvent = (eventName: string, eventData?: Record<string, any>): void => {
  if (!window.fbq) return;
  
  try {
    window.fbq('track', eventName, eventData);
    console.log('Facebook event sent:', eventName, eventData);
  } catch (error) {
    console.error('Error sending Facebook event:', error);
  }
};

// Initialize all enabled pixels
export const initializePixels = (): void => {
  const settings = getPixelSettings();
  if (!settings) return;
  
  // Initialize Google Tag Manager if enabled
  if (settings.google.enabled && settings.google.tagId) {
    initGoogleTagManager(settings.google.tagId);
  }
  
  // Initialize Facebook Pixel if enabled
  if (settings.facebook.enabled && settings.facebook.pixelId) {
    initFacebookPixel(settings.facebook.pixelId);
  }
};

// Send Page View event if enabled
export const trackPageView = (pagePath: string): void => {
  const settings = getPixelSettings();
  if (!settings) return;
  
  // Track Google Page View
  if (settings.google.enabled && settings.google.events.pageView) {
    sendGoogleEvent('page_view', { page_path: pagePath });
  }
  
  // Track Facebook Page View
  if (settings.facebook.enabled && settings.facebook.events.pageView) {
    sendFacebookEvent('PageView');
  }
};

// Track purchase event
export const trackPurchase = (purchaseData: {
  value: number;
  currency?: string;
  transactionId?: string;
  products?: any[];
}): void => {
  const settings = getPixelSettings();
  if (!settings) return;
  
  const { value, currency = 'BRL', transactionId, products } = purchaseData;
  
  // Track Google Purchase
  if (settings.google.enabled && settings.google.events.purchase) {
    sendGoogleEvent('purchase', {
      transaction_id: transactionId,
      value: value,
      currency: currency,
      items: products
    });
  }
  
  // Track Facebook Purchase
  if (settings.facebook.enabled && settings.facebook.events.purchase) {
    sendFacebookEvent('Purchase', {
      value: value,
      currency: currency,
      content_ids: products?.map(p => p.id) || [],
      content_type: 'product'
    });
  }
};

// Track Add to Cart event
export const trackAddToCart = (cartData: {
  value: number;
  currency?: string;
  productId?: string;
  productName?: string;
}): void => {
  const settings = getPixelSettings();
  if (!settings) return;
  
  const { value, currency = 'BRL', productId, productName } = cartData;
  
  // Facebook Add to Cart
  if (settings.facebook.enabled && settings.facebook.events.addToCart) {
    sendFacebookEvent('AddToCart', {
      value: value,
      currency: currency,
      content_ids: [productId],
      content_name: productName,
      content_type: 'product'
    });
  }
};

// Track custom event
export const trackCustomEvent = (
  platform: 'google' | 'facebook',
  eventName: string,
  eventData?: Record<string, any>
): void => {
  const settings = getPixelSettings();
  if (!settings) return;
  
  // Find if this custom event is enabled
  const isEnabled = platform === 'google'
    ? settings.google.enabled && settings.google.customEvents.some(e => e.name === eventName && e.enabled)
    : settings.facebook.enabled && settings.facebook.customEvents.some(e => e.name === eventName && e.enabled);
  
  if (!isEnabled) return;
  
  // Send the event
  if (platform === 'google') {
    sendGoogleEvent(eventName, eventData);
  } else {
    sendFacebookEvent(eventName, eventData);
  }
};

// Add type definitions for global objects
declare global {
  interface Window {
    dataLayer: any[];
    fbq: any;
  }
}
