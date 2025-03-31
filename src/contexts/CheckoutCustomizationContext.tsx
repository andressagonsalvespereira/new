
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CheckoutCustomization {
  id: number;
  header_message: string;
  banner_image_url: string;
  show_banner: boolean;
  button_color: string;
  button_text_color: string;
  heading_color: string;
}

interface CheckoutCustomizationContextType {
  customization: CheckoutCustomization | null;
  loading: boolean;
  error: string | null;
  updateCustomization: (data: Partial<CheckoutCustomization>) => Promise<void>;
  uploadBannerImage: (file: File) => Promise<string | null>;
  refreshCustomization: () => Promise<void>;
}

const CheckoutCustomizationContext = createContext<CheckoutCustomizationContextType | undefined>(undefined);

export const useCheckoutCustomization = () => {
  const context = useContext(CheckoutCustomizationContext);
  if (!context) {
    throw new Error('useCheckoutCustomization must be used within a CheckoutCustomizationProvider');
  }
  return context;
};

interface CheckoutCustomizationProviderProps {
  children: ReactNode;
}

export const CheckoutCustomizationProvider: React.FC<CheckoutCustomizationProviderProps> = ({ children }) => {
  const [customization, setCustomization] = useState<CheckoutCustomization | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCustomization = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use 'any' to bypass type checking for the table name
      const { data, error: fetchError } = await (supabase as any)
        .from('checkout_customization')
        .select('*')
        .order('id', { ascending: false })
        .limit(1)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      setCustomization(data as CheckoutCustomization);
    } catch (err) {
      console.error('Error fetching checkout customization:', err);
      setError('Falha ao carregar configurações de personalização do checkout');
    } finally {
      setLoading(false);
    }
  };

  const refreshCustomization = async () => {
    await fetchCustomization();
  };

  const updateCustomization = async (data: Partial<CheckoutCustomization>) => {
    try {
      setLoading(true);
      setError(null);

      if (!customization?.id) {
        throw new Error('No customization record found to update');
      }

      // Use 'any' to bypass type checking for the table name
      const { error: updateError } = await (supabase as any)
        .from('checkout_customization')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', customization.id);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: 'Personalização atualizada',
        description: 'As configurações do checkout foram atualizadas com sucesso',
      });

      await fetchCustomization();
    } catch (err) {
      console.error('Error updating checkout customization:', err);
      setError('Falha ao atualizar configurações de personalização');
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar as configurações de personalização',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadBannerImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}-${Date.now()}.${fileExt}`;
      const filePath = `checkout-banners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      toast({
        title: 'Imagem enviada',
        description: 'A imagem do banner foi enviada com sucesso',
      });

      return data.publicUrl;
    } catch (err) {
      console.error('Error uploading banner image:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar a imagem do banner',
        variant: 'destructive',
      });
      return null;
    }
  };

  useEffect(() => {
    fetchCustomization();
  }, []);

  const value = {
    customization,
    loading,
    error,
    updateCustomization,
    uploadBannerImage,
    refreshCustomization
  };

  return (
    <CheckoutCustomizationContext.Provider value={value}>
      {children}
    </CheckoutCustomizationContext.Provider>
  );
};
