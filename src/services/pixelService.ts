import { supabase } from '@/integrations/supabase/client';

export const updatePixelSettings = async (
  googlePixelEnabled: boolean, 
  googlePixelId: string, 
  googlePageView: boolean, 
  googlePurchase: boolean, 
  metaPixelEnabled: boolean, 
  metaPixelId: string, 
  metaPageView: boolean, 
  metaAddToCart: boolean, 
  metaPurchase: boolean
) => {
  const { error } = await supabase
    .from('pixel_settings')
    .update({
      google_pixel_enabled: googlePixelEnabled,
      google_pixel_id: googlePixelId,
      google_page_view: googlePageView,
      google_purchase: googlePurchase,
      meta_pixel_enabled: metaPixelEnabled,
      meta_pixel_id: metaPixelId,
      meta_page_view: metaPageView,
      meta_add_to_cart: metaAddToCart,
      meta_purchase: metaPurchase,
      updated_at: new Date().toISOString()
    })
    .eq('id', 1);

  if (error) {
    console.error('Error updating pixel settings:', error);
    throw error;
  }
};
