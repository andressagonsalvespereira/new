
// Define types for pixel settings
export interface PixelSettings {
  google: {
    enabled: boolean;
    tagId: string;
    events: {
      pageView: boolean;
      purchase: boolean;
    };
    customEvents: Array<{
      name: string;
      trigger: string;
    }>;
  };
  facebook: {
    enabled: boolean;
    pixelId: string;
    events: {
      pageView: boolean;
      purchase: boolean;
      addToCart: boolean;
    };
    customEvents: Array<{
      name: string;
      trigger: string;
    }>;
  };
}

const defaultPixelSettings: PixelSettings = {
  google: {
    enabled: false,
    tagId: '',
    events: {
      pageView: true,
      purchase: true
    },
    customEvents: []
  },
  facebook: {
    enabled: false,
    pixelId: '',
    events: {
      pageView: true,
      purchase: true,
      addToCart: true
    },
    customEvents: []
  }
};

// Get pixel settings from localStorage or return defaults
export const getPixelSettings = (): PixelSettings => {
  try {
    const settings = localStorage.getItem('pixelSettings');
    if (settings) {
      return JSON.parse(settings);
    }
  } catch (error) {
    console.error('Error loading pixel settings:', error);
  }
  return defaultPixelSettings;
};

// Save pixel settings to localStorage
export const savePixelSettings = (settings: PixelSettings): void => {
  try {
    localStorage.setItem('pixelSettings', JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving pixel settings:', error);
  }
};

// Initialize pixels based on settings
export const initializePixels = (): void => {
  const settings = getPixelSettings();
  
  // Initialize Google Tag Manager
  if (settings.google.enabled && settings.google.tagId) {
    initializeGoogleTagManager(settings.google.tagId);
  }
  
  // Initialize Facebook Pixel
  if (settings.facebook.enabled && settings.facebook.pixelId) {
    initializeFacebookPixel(settings.facebook.pixelId);
  }
};

// Initialize Google Tag Manager
const initializeGoogleTagManager = (tagId: string): void => {
  try {
    // Create dataLayer if it doesn't exist
    window.dataLayer = window.dataLayer || [];
    
    // Push gtm.js event
    window.dataLayer.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js'
    });
    
    // Create script element
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${tagId}`;
    
    // Append to head
    document.head.appendChild(script);
    
    console.log('Google Tag Manager initialized with ID:', tagId);
  } catch (error) {
    console.error('Error initializing Google Tag Manager:', error);
  }
};

// Initialize Facebook Pixel
const initializeFacebookPixel = (pixelId: string): void => {
  try {
    // Initialize Facebook Pixel
    !function(f: any, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function() {
        n.callMethod ?
          n.callMethod.apply(n, arguments) :
          n.queue.push(arguments)
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
      if (s && s.parentNode) {
        s.parentNode.insertBefore(t, s);
      } else {
        b.head.appendChild(t);
      }
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    
    // Initialize with pixel ID
    if (typeof window.fbq === 'function') {
      window.fbq('init', pixelId);
    }
    
    console.log('Facebook Pixel initialized with ID:', pixelId);
  } catch (error) {
    console.error('Error initializing Facebook Pixel:', error);
  }
};

// Track page view
export const trackPageView = (pagePath: string): void => {
  const settings = getPixelSettings();
  
  try {
    // Track with Google Tag Manager
    if (settings.google.enabled && settings.google.events.pageView && window.dataLayer) {
      window.dataLayer.push({
        event: 'page_view',
        page_path: pagePath
      });
      console.log('Google Tag Manager: Page view tracked', pagePath);
    }
    
    // Track with Facebook Pixel
    if (settings.facebook.enabled && settings.facebook.events.pageView && window.fbq) {
      window.fbq('track', 'PageView');
      console.log('Facebook Pixel: Page view tracked', pagePath);
    }
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
};

// Track purchase event
interface PurchaseEventData {
  value: number;
  transactionId: string;
  products: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}

export const trackPurchase = (data: PurchaseEventData): void => {
  const settings = getPixelSettings();
  
  try {
    // Track with Google Tag Manager
    if (settings.google.enabled && settings.google.events.purchase && window.dataLayer) {
      window.dataLayer.push({
        event: 'purchase',
        ecommerce: {
          transaction_id: data.transactionId,
          value: data.value,
          items: data.products.map(product => ({
            item_id: product.id,
            item_name: product.name,
            price: product.price,
            quantity: product.quantity
          }))
        }
      });
      console.log('Google Tag Manager: Purchase tracked', data);
    }
    
    // Track with Facebook Pixel
    if (settings.facebook.enabled && settings.facebook.events.purchase && window.fbq) {
      window.fbq('track', 'Purchase', {
        value: data.value,
        currency: 'BRL',
        content_type: 'product',
        content_ids: data.products.map(product => product.id),
        contents: data.products.map(product => ({
          id: product.id,
          quantity: product.quantity,
          item_price: product.price
        }))
      });
      console.log('Facebook Pixel: Purchase tracked', data);
    }
  } catch (error) {
    console.error('Error tracking purchase:', error);
  }
};

// Track add to cart event
interface AddToCartEventData {
  value: number;
  productId: string;
  productName: string;
}

export const trackAddToCart = (data: AddToCartEventData): void => {
  const settings = getPixelSettings();
  
  try {
    // Track with Google Tag Manager
    if (settings.google.enabled && window.dataLayer) {
      window.dataLayer.push({
        event: 'add_to_cart',
        ecommerce: {
          value: data.value,
          items: [{
            item_id: data.productId,
            item_name: data.productName,
            price: data.value,
            quantity: 1
          }]
        }
      });
      console.log('Google Tag Manager: Add to cart tracked', data);
    }
    
    // Track with Facebook Pixel
    if (settings.facebook.enabled && settings.facebook.events.addToCart && window.fbq) {
      window.fbq('track', 'AddToCart', {
        value: data.value,
        currency: 'BRL',
        content_type: 'product',
        content_ids: [data.productId],
        contents: [{
          id: data.productId,
          quantity: 1,
          item_price: data.value
        }]
      });
      console.log('Facebook Pixel: Add to cart tracked', data);
    }
  } catch (error) {
    console.error('Error tracking add to cart:', error);
  }
};

// Declare global types for window
declare global {
  interface Window {
    dataLayer: any[];
    fbq: any;
    _fbq: any;
  }
}
