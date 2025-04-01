
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useProducts } from '@/contexts/ProductContext';
import { Product } from '@/types/product';

export const useProductCheckout = (productSlug: string | undefined) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getProductBySlug, loading: productsLoading, products, isOffline } = useProducts();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [productNotFound, setProductNotFound] = useState(false);
  
  useEffect(() => {
    async function fetchProduct() {
      try {
        if (!productSlug) {
          console.error('Slug do produto não fornecido');
          setLoading(false);
          setProductNotFound(true);
          return;
        }
        
        setLoading(true);
        setProductNotFound(false);
        console.log('Buscando produto com slug:', productSlug);
        console.log('Estado offline:', isOffline);
        console.log('Produtos disponíveis no contexto:', products);
        
        // Log all available slugs for debugging
        if (products && products.length > 0) {
          console.log('Slugs disponíveis:', products.map(p => p.slug));
        }
        
        // Primeiro, procuramos exatamente pelo slug fornecido
        let productData = await getProductBySlug(productSlug);
        console.log('Resultado da busca por slug exato:', productData);
        
        // Se não encontrado com o slug exato, verificamos se pode haver uma correspondência parcial
        if (!productData) {
          console.log('Produto não encontrado com slug exato, verificando produtos em cache...');
          
          // Verificar se já temos produtos na lista e procurar pelo slug
          if (products && products.length > 0) {
            // Verificar correspondência exata primeiro
            let cachedProduct = products.find(p => p.slug === productSlug);
            console.log('Produto encontrado com correspondência exata?', !!cachedProduct);
            
            if (!cachedProduct) {
              console.log('Tentando buscar com slug parcial...');
              // Verificar se o slug é parte de um slug de produto 
              // (caso tenha havido um sufixo adicionado como '-1')
              const baseSlug = productSlug.split('-')[0]; // Obter slug base sem sufixo
              console.log('Tentando com slug base:', baseSlug);
              
              cachedProduct = products.find(
                p => p.slug === baseSlug || p.slug.startsWith(baseSlug + '-')
              );
              
              if (cachedProduct) {
                console.log('Produto encontrado com slug parcial:', cachedProduct);
              } else {
                console.log('Nenhuma correspondência parcial encontrada com o slug base');
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
            console.log('Resultado da busca por slug base:', productData);
          }
          
          // Verificar correspondência por ID se o slug parece ser um número
          if (!productData && /^\d+$/.test(productSlug)) {
            console.log('Slug parece ser um ID, tentando buscar por ID:', productSlug);
            const productId = productSlug;
            // Usar o contexto de produto para obter o produto por ID
            const productById = products.find(p => p.id === productId);
            if (productById) {
              console.log('Produto encontrado por ID:', productById);
              productData = productById;
            }
          }
          
          // Se continua não encontrado, tenta procurar por substring
          if (!productData && products.length > 0) {
            console.log('Tentando buscar produtos que contenham o slug como substring...');
            const matchingProducts = products.filter(p => 
              p.slug.includes(productSlug) || productSlug.includes(p.slug)
            );
            
            if (matchingProducts.length > 0) {
              console.log('Produtos encontrados por substring:', matchingProducts);
              productData = matchingProducts[0]; // Usar o primeiro produto correspondente
            }
          }
          
          // Último recurso - se ainda não encontramos, simplesmente pegar o primeiro produto disponível (se houver)
          if (!productData && products.length > 0) {
            console.log('Nenhuma correspondência encontrada. Usando o primeiro produto disponível como fallback');
            productData = products[0];
          }
        }
        
        if (productData) {
          console.log('Produto final selecionado:', productData);
          setProduct(productData);
          setProductNotFound(false);
        } else {
          console.error('Produto não encontrado para o slug:', productSlug);
          console.log('Todos os produtos disponíveis:', products);
          setProductNotFound(true);
          toast({
            title: "Produto não encontrado",
            description: `Não foi possível encontrar o produto com identificador "${productSlug}"`,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Erro ao carregar produto:', error);
        setProductNotFound(true);
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
  }, [productSlug, getProductBySlug, navigate, toast, productsLoading, products, isOffline]);
  
  return {
    product,
    loading: loading || productsLoading,
    productNotFound
  };
};
