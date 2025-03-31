
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CheckoutCustomization {
  header_message: string;
  banner_image_url: string;
  show_banner: boolean;
  button_color: string;
  button_text_color: string;
  heading_color: string;
}

const CheckoutHeader = () => {
  const [timeLeft, setTimeLeft] = useState({
    minutes: 14,
    seconds: 59
  });
  const [customization, setCustomization] = useState<CheckoutCustomization>({
    header_message: 'Oferta por tempo limitado!',
    banner_image_url: '',
    show_banner: true,
    button_color: '#3b82f6',
    button_text_color: '#ffffff',
    heading_color: '#000000'
  });

  useEffect(() => {
    // Fetch customization settings
    const fetchCustomization = async () => {
      try {
        // Use the any type to bypass TypeScript checking for the table name
        const { data, error } = await (supabase as any)
          .from('checkout_customization')
          .select('header_message, banner_image_url, show_banner, button_color, button_text_color, heading_color')
          .order('id', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          console.error('Error fetching checkout customization:', error);
          return;
        }

        if (data) {
          setCustomization(data as CheckoutCustomization);
        }
      } catch (err) {
        console.error('Failed to fetch checkout customization', err);
      }
    };

    fetchCustomization();

    // Timer logic
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { minutes: prev.minutes - 1, seconds: 59 };
        } else {
          clearInterval(timer);
          return { minutes: 0, seconds: 0 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (minutes: number, seconds: number) => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {customization.show_banner && customization.banner_image_url && (
        <div className="w-full">
          <img 
            src={customization.banner_image_url} 
            alt="Checkout Banner" 
            className="w-full h-auto object-cover"
          />
        </div>
      )}
      <header className="bg-gradient-to-r from-black to-gray-800 text-white py-3 px-4 text-center">
        <div className="max-w-5xl mx-auto flex justify-center items-center space-x-3">
          <Clock className="h-5 w-5 text-yellow-400" />
          <div className="text-sm md:text-base">
            {customization.header_message} <span className="font-bold">{formatTime(timeLeft.minutes, timeLeft.seconds)}</span>
          </div>
        </div>
      </header>
    </>
  );
};

export default CheckoutHeader;
