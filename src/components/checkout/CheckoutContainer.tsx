
import React, { useEffect, useState } from 'react';
import CheckoutHeader from './CheckoutHeader';
import CheckoutFooter from './CheckoutFooter';
import { supabase } from '@/integrations/supabase/client';

interface CheckoutContainerProps {
  children: React.ReactNode;
}

interface CheckoutCustomization {
  button_color?: string;
  button_text_color?: string;
  button_text?: string;
}

const CheckoutContainer: React.FC<CheckoutContainerProps> = ({ children }) => {
  const [customization, setCustomization] = useState<CheckoutCustomization>({
    button_color: '#3b82f6',
    button_text_color: '#ffffff',
    button_text: 'Finalizar Pagamento'
  });

  useEffect(() => {
    const fetchCustomization = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('checkout_customization')
          .select('button_color, button_text_color, button_text')
          .order('id', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          console.error('Error fetching checkout customization:', error);
          return;
        }

        if (data) {
          setCustomization({
            ...data,
            button_text: data.button_text || 'Finalizar Pagamento'
          });
        }
      } catch (err) {
        console.error('Failed to fetch checkout customization', err);
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
