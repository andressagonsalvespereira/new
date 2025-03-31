
// Define interfaces for pixel settings
export interface GooglePixelSettings {
  enabled: boolean;
  tagId: string;
  pageView: boolean;
  purchase: boolean;
}

export interface FacebookPixelSettings {
  enabled: boolean;
  pixelId: string;
  pageView: boolean;
  addToCart: boolean;
  purchase: boolean;
}

export interface PixelSettings {
  google: GooglePixelSettings;
  facebook: FacebookPixelSettings;
}

// Interface for purchase event data
export interface TrackPurchaseData {
  transactionId: string;
  value: number;
  products: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}

// Default settings
const defaultSettings: PixelSettings = {
  google: {
    enabled: false,
    tagId: '',
    pageView: false,
    purchase: false
  },
  facebook: {
    enabled: false,
    pixelId: '',
    pageView: false,
    addToCart: false,
    purchase: false
  }
};

// Retrieves current pixel settings from database (Supabase)
export const getPixelSettings = async (): Promise<PixelSettings> => {
  try {
    // In a real implementation, fetch from database
    // For now, simulating a response
    const settings = await import('@/integrations/supabase/client').then(async ({ supabase }) => {
      const { data, error } = await supabase
        .from('pixel_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) {
        console.error('Error fetching pixel settings:', error);
        return defaultSettings;
      }
      
      if (!data) {
        return defaultSettings;
      }
      
      return {
        google: {
          enabled: data.google_pixel_enabled || false,
          tagId: data.google_pixel_id || '',
          pageView: data.google_page_view || false,
          purchase: data.google_purchase || false
        },
        facebook: {
          enabled: data.meta_pixel_enabled || false,
          pixelId: data.meta_pixel_id || '',
          pageView: data.meta_page_view || false,
          addToCart: data.meta_add_to_cart || false,
          purchase: data.meta_purchase || false
        }
      };
    });
    
    return settings;
  } catch (error) {
    console.error('Error getting pixel settings:', error);
    return defaultSettings;
  }
};

// Saves pixel settings to database
export const savePixelSettings = async (settings: PixelSettings): Promise<boolean> => {
  try {
    // In a real implementation, save to database
    // For now, simulating a response
    await import('@/integrations/supabase/client').then(async ({ supabase }) => {
      const { error } = await supabase
        .from('pixel_settings')
        .upsert({
          google_pixel_enabled: settings.google.enabled,
          google_pixel_id: settings.google.tagId,
          google_page_view: settings.google.pageView,
          google_purchase: settings.google.purchase,
          meta_pixel_enabled: settings.facebook.enabled,
          meta_pixel_id: settings.facebook.pixelId,
          meta_page_view: settings.facebook.pageView,
          meta_add_to_cart: settings.facebook.addToCart,
          meta_purchase: settings.facebook.purchase,
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        throw error;
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error saving pixel settings:', error);
    return false;
  }
};

// Initializes tracking pixels based on settings
export const initializePixels = async (): Promise<void> => {
  try {
    const settings = await getPixelSettings();
    
    // Initialize Google Tag (gtag.js)
    if (settings.google.enabled && settings.google.tagId) {
      initializeGoogleTag(settings.google.tagId);
    }
    
    // Initialize Facebook Pixel
    if (settings.facebook.enabled && settings.facebook.pixelId) {
      initializeFacebookPixel(settings.facebook.pixelId);
    }
  } catch (error) {
    console.error('Error initializing pixels:', error);
  }
};

// Initializes Google Tag Manager
const initializeGoogleTag = (tagId: string): void => {
  // Avoid duplicate initialization
  if (window.GA_TRACKING_ID === tagId) {
    return;
  }
  
  try {
    window.GA_TRACKING_ID = tagId;
    
    // Initialize dataLayer array
    window.dataLayer = window.dataLayer || [];
    
    // Define gtag function
    function gtag(...args: any[]) {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    
    // Initial gtag setup
    gtag('js', new Date());
    gtag('config', tagId);
    
    // Inject the gtag.js script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${tagId}`;
    document.head.appendChild(script);
    
    console.log('Google Tag initialized with ID:', tagId);
  } catch (error) {
    console.error('Error initializing Google Tag:', error);
  }
};

// Initializes Facebook Pixel
const initializeFacebookPixel = (pixelId: string): void => {
  // Avoid duplicate initialization
  if (window._fbq) {
    return;
  }
  
  try {
    // Initialize Facebook Pixel code
    (function(f: any, b: any, e: any, v: any, n: any, t: any, s: any) {
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
    })(
      window,
      document,
      'script',
      'https://connect.facebook.net/en_US/fbevents.js',
      window.fbq
    );
    
    // Initialize with the Pixel ID
    window.fbq('init', pixelId);
    
    console.log('Facebook Pixel initialized with ID:', pixelId);
  } catch (error) {
    console.error('Error initializing Facebook Pixel:', error);
  }
};

// Tracks page views
export const trackPageView = (path: string): void => {
  try {
    let result = getPixelSettings();
    // Using Promise.then instead of checking the Promise directly
    result.then(settings => {
      // Track Google gtag pageview
      if (settings.google.enabled && settings.google.pageView && window.gtag) {
        window.gtag('event', 'page_view', {
          page_path: path
        });
        console.log('Google pageview tracked:', path);
      }
      
      // Track Facebook pageview
      if (settings.facebook.enabled && settings.facebook.pageView && window.fbq) {
        window.fbq('track', 'PageView');
        console.log('Facebook pageview tracked:', path);
      }
    });
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
};

// Tracks add to cart events
export const trackAddToCart = (productId: string, productName: string, price: number): void => {
  try {
    let result = getPixelSettings();
    // Using Promise.then instead of checking the Promise directly
    result.then(settings => {
      // Track Facebook add to cart
      if (settings.facebook.enabled && settings.facebook.addToCart && window.fbq) {
        window.fbq('track', 'AddToCart', {
          content_ids: [productId],
          content_name: productName,
          value: price,
          currency: 'BRL'
        });
        console.log('Facebook AddToCart tracked:', productName);
      }
    });
  } catch (error) {
    console.error('Error tracking add to cart:', error);
  }
};

// Tracks purchase events
export const trackPurchase = (data: TrackPurchaseData): void => {
  try {
    let result = getPixelSettings();
    // Using Promise.then instead of checking the Promise directly
    result.then(settings => {
      // Track Google purchase
      if (settings.google.enabled && settings.google.purchase && window.gtag) {
        window.gtag('event', 'purchase', {
          transaction_id: data.transactionId,
          value: data.value,
          currency: 'BRL',
          items: data.products.map(product => ({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: product.quantity
          }))
        });
        console.log('Google purchase tracked:', data.transactionId);
      }
      
      // Track Facebook purchase
      if (settings.facebook.enabled && settings.facebook.purchase && window.fbq) {
        window.fbq('track', 'Purchase', {
          content_ids: data.products.map(p => p.id),
          content_name: data.products.map(p => p.name).join(', '),
          value: data.value,
          currency: 'BRL',
          num_items: data.products.reduce((sum, p) => sum + p.quantity, 0)
        });
        console.log('Facebook purchase tracked:', data.transactionId);
      }
    });
  } catch (error) {
    console.error('Error tracking purchase:', error);
  }
};
