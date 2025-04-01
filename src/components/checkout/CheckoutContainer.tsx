
import React, { useEffect, useState } from 'react';
import CheckoutHeader from './CheckoutHeader';
import CheckoutFooter from './CheckoutFooter';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CheckoutContainerProps {
  children: React.ReactNode;
}

interface CheckoutCustomization {
  button_color?: string;
  button_text_color?: string;
  button_text?: string;
}

const CheckoutContainer: React.FC<CheckoutContainerProps> = ({ children }) => {
  const { toast } = useToast();
  const [customization, setCustomization] = useState<CheckoutCustomization>({
    button_color: '#3b82f6',
    button_text_color: '#ffffff',
    button_text: 'Finalizar Pagamento'
  });
  const [isCustomizationLoaded, setIsCustomizationLoaded] = useState(false);

  useEffect(() => {
    const fetchCustomization = async () => {
      try {
        console.log("Fetching checkout customization...");
        
        const { data, error } = await supabase
          .from('checkout_customization')
          .select('button_color, button_text_color, button_text')
          .order('id', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          // Using more specific error logging
          if (error.code === "PGRST116") {
            console.log("No checkout customization found, using defaults");
          } else {
            console.error('Error fetching checkout customization:', error);
          }
          
          // Continue with defaults
          setIsCustomizationLoaded(true);
          return;
        }

        if (data) {
          console.log("Checkout customization loaded:", data);
          setCustomization({
            ...data,
            button_text: data.button_text || 'Finalizar Pagamento'
          });
        }
        
        setIsCustomizationLoaded(true);
      } catch (err) {
        console.error('Failed to fetch checkout customization', err);
        // Continue with defaults even on error
        setIsCustomizationLoaded(true);
      }
    };

    fetchCustomization();
  }, []);

  // Add CSS variables for checkout button styling
  const customStyles = {
    '--button-color': customization.button_color || '#3b82f6',
    '--button-text-color': customization.button_text_color || '#ffffff',
    '--button-text': `'${customization.button_text || 'Finalizar Pagamento'}'`,
  } as React.CSSProperties;

  // Show a simple loading state while customization is loading
  if (!isCustomizationLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 touch-manipulation" style={customStyles}>
      <CheckoutHeader />
      <main className="max-w-xl mx-auto py-2 px-4">
        {children}
      </main>
      <CheckoutFooter />
    </div>
  );
};

export default CheckoutContainer;
