
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
          // Check exact match first
          let cachedProduct = products.find(p => p.slug === productSlug);
          
          // If not found, try checking if the slug is part of a product slug 
          // (in case there was a suffix added like '-1')
          if (!cachedProduct) {
            console.log('Slug exato não encontrado, tentando buscar slug parcial...');
            const baseSlug = productSlug.split('-')[0]; // Get base slug without suffix
            cachedProduct = products.find(p => p.slug === baseSlug || p.slug.startsWith(baseSlug + '-'));
          }
          
          if (cachedProduct) {
            console.log('Produto encontrado no cache:', cachedProduct);
            setProduct(cachedProduct);
            setLoading(false);
            return;
          }
        }
        
        // Try to get the product from API
        let productData = await getProductBySlug(productSlug);
        
        // If product not found with exact slug, try with the base slug (without suffix)
        if (!productData && productSlug.includes('-')) {
          const baseSlug = productSlug.split('-')[0];
          console.log('Tentando buscar com slug base:', baseSlug);
          productData = await getProductBySlug(baseSlug);
        }
        
        console.log('Dados do produto encontrado:', productData);
        
        if (!productData) {
          console.error('Produto não encontrado para o slug:', productSlug);
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
