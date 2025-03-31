
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
        
        // Primeiro, procuramos exatamente pelo slug fornecido
        let productData = await getProductBySlug(productSlug);
        
        // Se não encontrado com o slug exato, verificamos se pode haver uma correspondência parcial
        if (!productData) {
          console.log('Produto não encontrado com slug exato, verificando produtos em cache...');
          
          // Verificar se já temos produtos na lista e procurar pelo slug
          if (products && products.length > 0) {
            // Verificar correspondência exata primeiro
            let cachedProduct = products.find(p => p.slug === productSlug);
            
            // Se não encontrado, verificar se o slug é parte de um slug de produto 
            // (caso tenha havido um sufixo adicionado como '-1')
            if (!cachedProduct) {
              console.log('Tentando buscar com slug parcial...');
              const baseSlug = productSlug.split('-')[0]; // Obter slug base sem sufixo
              cachedProduct = products.find(
                p => p.slug === baseSlug || p.slug.startsWith(baseSlug + '-')
              );
              
              if (cachedProduct) {
                console.log('Produto encontrado com slug parcial:', cachedProduct);
              }
            }
            
            if (cachedProduct) {
              productData = cachedProduct;
            }
          }
          
          // Se ainda não encontramos, tentamos buscar novamente pela API pelo slug base
          if (!productData && productSlug.includes('-')) {
            const baseSlug = productSlug.split('-')[0];
            console.log('Tentando buscar com slug base via API:', baseSlug);
            productData = await getProductBySlug(baseSlug);
          }
        }
        
        if (productData) {
          console.log('Produto encontrado:', productData);
          setProduct(productData);
        } else {
          console.error('Produto não encontrado para o slug:', productSlug);
          toast({
            title: "Produto não encontrado",
            description: `Não foi possível encontrar o produto com slug "${productSlug}"`,
            variant: "destructive",
          });
        }
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
