
import React, { useState } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Control } from 'react-hook-form';
import { Upload, X } from 'lucide-react';
import { useCheckoutCustomization } from '@/contexts/CheckoutCustomizationContext';

interface BannerImageUploadProps {
  name: string;
  control: Control<any>;
  setValue: (name: string, value: string) => void;
}

const BannerImageUpload: React.FC<BannerImageUploadProps> = ({
  name,
  control,
  setValue
}) => {
  const [uploading, setUploading] = useState(false);
  const { uploadBannerImage } = useCheckoutCustomization();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    setUploading(true);

    try {
      const imageUrl = await uploadBannerImage(file);
      if (imageUrl) {
        setValue(name, imageUrl);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Imagem do Banner</FormLabel>
          <FormControl>
            <div className="space-y-4">
              {field.value && (
                <div className="relative">
                  <img 
                    src={field.value}
                    alt="Banner preview"
                    className="w-full h-auto rounded-md object-cover max-h-40"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setValue(name, '')}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
              
              <div className="flex items-center">
                <input
                  type="file"
                  id="banner-upload"
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                />
                <label htmlFor="banner-upload">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploading}
                    asChild
                    className="cursor-pointer"
                  >
                    <div>
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? 'Enviando...' : 'Enviar Banner'}
                    </div>
                  </Button>
                </label>
              </div>
            </div>
          </FormControl>
          <FormDescription>
            Escolha uma imagem para o banner do checkout. Recomendamos imagens com proporção 10:3 para melhor visualização.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default BannerImageUpload;
