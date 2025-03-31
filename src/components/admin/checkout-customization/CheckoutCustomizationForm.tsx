
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, Save } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useCheckoutCustomization } from '@/contexts/CheckoutCustomizationContext';
import ColorPickerField from './ColorPickerField';
import BannerImageUpload from './BannerImageUpload';

const formSchema = z.object({
  header_message: z.string().min(1, "A mensagem do cabeçalho é obrigatória"),
  banner_image_url: z.string().optional(),
  show_banner: z.boolean(),
  button_color: z.string().min(1, "A cor do botão é obrigatória"),
  button_text_color: z.string().min(1, "A cor do texto do botão é obrigatória"),
  heading_color: z.string().min(1, "A cor dos títulos é obrigatória"),
  button_text: z.string().min(1, "O texto do botão é obrigatório"),
});

type FormValues = z.infer<typeof formSchema>;

const CheckoutCustomizationForm: React.FC = () => {
  const { customization, loading, updateCustomization } = useCheckoutCustomization();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      header_message: customization?.header_message || 'Oferta por tempo limitado!',
      banner_image_url: customization?.banner_image_url || '',
      show_banner: customization?.show_banner ?? true,
      button_color: customization?.button_color || '#3b82f6',
      button_text_color: customization?.button_text_color || '#ffffff',
      heading_color: customization?.heading_color || '#000000',
      button_text: customization?.button_text || 'Finalizar Pagamento',
    },
  });

  // Update form values when customization data is loaded
  React.useEffect(() => {
    if (customization) {
      form.reset({
        header_message: customization.header_message,
        banner_image_url: customization.banner_image_url,
        show_banner: customization.show_banner,
        button_color: customization.button_color,
        button_text_color: customization.button_text_color,
        heading_color: customization.heading_color,
        button_text: customization.button_text || 'Finalizar Pagamento',
      });
    }
  }, [customization, form]);

  const onSubmit = async (data: FormValues) => {
    await updateCustomization(data);
  };

  if (loading && !customization) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2">Carregando configurações...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personalização do Checkout</CardTitle>
        <CardDescription>
          Configure a aparência da página de checkout para melhorar a experiência do cliente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="header_message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mensagem do Cabeçalho</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite a mensagem do cabeçalho" {...field} />
                      </FormControl>
                      <FormDescription>
                        Esta mensagem será exibida no topo da página de checkout.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="button_text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Texto dos Botões</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o texto para os botões" {...field} />
                      </FormControl>
                      <FormDescription>
                        Este texto será exibido nos botões de finalização de compra.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="show_banner"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Exibir Banner</FormLabel>
                        <FormDescription>
                          Ative para exibir o banner no topo do checkout
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <ColorPickerField
                  name="button_color"
                  control={form.control}
                  label="Cor do Botão"
                  description="Selecione a cor dos botões de ação no checkout"
                />
                
                <ColorPickerField
                  name="button_text_color"
                  control={form.control}
                  label="Cor do Texto do Botão"
                  description="Selecione a cor do texto dos botões"
                />
                
                <ColorPickerField
                  name="heading_color"
                  control={form.control}
                  label="Cor dos Títulos"
                  description="Selecione a cor dos títulos no checkout"
                />
              </div>
              
              <div>
                <BannerImageUpload
                  name="banner_image_url"
                  control={form.control}
                  setValue={form.setValue}
                />
                
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Prévia do Checkout</h3>
                  <div className="border rounded-md p-4 bg-gray-50">
                    {form.watch('show_banner') && form.watch('banner_image_url') && (
                      <div className="mb-4">
                        <img 
                          src={form.watch('banner_image_url')} 
                          alt="Banner preview" 
                          className="w-full h-auto rounded-md"
                        />
                      </div>
                    )}
                    
                    <div 
                      className="bg-gray-800 text-white p-3 text-center mb-4 rounded-md"
                      style={{ color: '#ffffff' }}
                    >
                      {form.watch('header_message')}
                    </div>
                    
                    <div className="space-y-4">
                      <h3 
                        className="text-lg font-medium"
                        style={{ color: form.watch('heading_color') }}
                      >
                        Informações do Produto
                      </h3>
                      <div className="py-2 border-t border-b">
                        <p>Produto de Exemplo</p>
                        <p className="text-gray-500">R$ 99,90</p>
                      </div>
                      <button 
                        className="w-full py-2 rounded-md text-center"
                        style={{ 
                          backgroundColor: form.watch('button_color'),
                          color: form.watch('button_text_color')
                        }}
                      >
                        {form.watch('button_text') || 'Finalizar Compra'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={form.formState.isSubmitting}
                className="flex items-center"
              >
                {form.formState.isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Salvar Alterações
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CheckoutCustomizationForm;
