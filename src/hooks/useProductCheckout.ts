
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useProducts } from '@/contexts/ProductContext';
import { Product } from '@/types/product';

export const useProductCheckout = (productSlug: string | undefined) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getProductBySlug, loading: productsLoading } = useProducts();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchProduct() {
      try {
        if (!productSlug) {
          console.error('Slug do produto não fornecido');
          throw new Error('Slug do produto não fornecido');
        }
        
        setLoading(true);
        console.log('Buscando produto com slug:', productSlug);
        
        const productData = await getProductBySlug(productSlug);
        
        console.log('Dados do produto encontrado:', productData);
        
        if (!productData) {
          console.error('Produto não encontrado para o slug:', productSlug);
          throw new Error('Produto não encontrado');
        }
        
        setProduct(productData);
      } catch (error) {
        console.error('Erro ao carregar produto:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do produto.",
          variant: "destructive",
        });
        
        // Descomentar essa linha para redirecionar o usuário para a página inicial em caso de erro
        // navigate('/');
      } finally {
        setLoading(false);
      }
    }
    
    if (!productsLoading) {
      fetchProduct();
    }
  }, [productSlug, getProductBySlug, navigate, toast, productsLoading]);
  
  return {
    product,
    loading: loading || productsLoading
  };
};
