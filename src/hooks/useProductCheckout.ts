
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useProducts } from '@/contexts/ProductContext';
import { Product } from '@/types/product';

export const useProductCheckout = (productSlug: string | undefined) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getProductBySlug, loading: productsLoading, products } = useProducts();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchProduct() {
      try {
        if (!productSlug) {
          console.error('Slug do produto não fornecido');
          setLoading(false);
          return;
        }
        
        setLoading(true);
        console.log('Buscando produto com slug:', productSlug);
        
        // Verifica se já temos produtos na lista e procura pelo slug
        if (products && products.length > 0) {
          console.log('Verificando produtos em cache primeiro...');
          const cachedProduct = products.find(p => p.slug === productSlug);
          if (cachedProduct) {
            console.log('Produto encontrado no cache:', cachedProduct);
            setProduct(cachedProduct);
            setLoading(false);
            return;
          }
        }
        
        const productData = await getProductBySlug(productSlug);
        
        console.log('Dados do produto encontrado:', productData);
        
        if (!productData) {
          console.error('Produto não encontrado para o slug:', productSlug);
          // Apenas registra o erro, mas não lança exceção para evitar problemas no carregamento
          setProduct(null);
          setLoading(false);
          toast({
            title: "Produto não encontrado",
            description: `Não foi possível encontrar o produto com slug "${productSlug}"`,
            variant: "destructive",
          });
          return;
        }
        
        setProduct(productData);
      } catch (error) {
        console.error('Erro ao carregar produto:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do produto.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    
    if (!productsLoading) {
      fetchProduct();
    }
  }, [productSlug, getProductBySlug, navigate, toast, productsLoading, products]);
  
  return {
    product,
    loading: loading || productsLoading,
    productNotFound: !loading && !productsLoading && !product
  };
};
