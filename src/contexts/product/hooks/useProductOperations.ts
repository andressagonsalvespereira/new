
import { useCallback, useMemo } from 'react';
import { Product, CriarProdutoInput } from '@/types/product';
import {
  adicionarProdutoAPI,
  editarProdutoAPI,
  removerProdutoAPI,
  obterProdutoPorIdAPI,
  obterProdutoPorSlugAPI
} from '../productApi';

interface ProductOperationsProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  isOffline: boolean;
}

export const useProductOperations = (props: ProductOperationsProps) => {
  const { products, setProducts, isOffline } = props;

  // Adicionar produto
  const addProduct = useCallback(async (productData: CriarProdutoInput): Promise<void> => {
    if (isOffline) {
      throw new Error('Não é possível adicionar produtos no modo offline');
    }
    
    const newProduct = await adicionarProdutoAPI(productData);
    
    setProducts(prevProducts => [newProduct, ...prevProducts]);
  }, [isOffline, setProducts]);

  // Editar produto
  const editProduct = useCallback(async (id: string, productData: Partial<Product>): Promise<void> => {
    if (isOffline) {
      // No modo offline, apenas atualiza o estado local
      setProducts(prevProducts =>
        prevProducts.map(product =>
          product.id === id ? { ...product, ...productData } : product
        )
      );
      return;
    }
    
    const updatedProduct = await editarProdutoAPI(id, productData);
    
    setProducts(prevProducts =>
      prevProducts.map(product =>
        product.id === id ? updatedProduct : product
      )
    );
  }, [isOffline, setProducts]);

  // Remover produto
  const removeProduct = useCallback(async (id: string): Promise<void> => {
    if (isOffline) {
      throw new Error('Não é possível remover produtos no modo offline');
    }
    
    await removerProdutoAPI(id);
    
    setProducts(prevProducts =>
      prevProducts.filter(product => product.id !== id)
    );
  }, [isOffline, setProducts]);

  // Buscar produto por ID
  const getProductById = useCallback(async (id: string): Promise<Product | undefined> => {
    console.log('Buscando produto por ID:', id);
    
    // Primeiro, tentamos buscar nos produtos já carregados
    const existingProduct = products.find(p => p.id === id);
    if (existingProduct) {
      console.log('Produto encontrado no estado local:', existingProduct);
      return existingProduct;
    }
    
    // Se não encontramos e estamos offline, retornamos undefined
    if (isOffline) {
      console.log('Modo offline - produto não encontrado no estado local');
      return undefined;
    }
    
    // Caso contrário, buscamos na API
    try {
      console.log('Produto não encontrado no estado local, buscando na API');
      const product = await obterProdutoPorIdAPI(id);
      
      // Se encontramos o produto, adicionamos ao estado local para futuras referências
      if (product) {
        setProducts(prev => {
          // Verificar se o produto já existe na lista
          if (!prev.some(p => p.id === product.id)) {
            return [...prev, product];
          }
          return prev;
        });
      }
      
      return product;
    } catch (error) {
      console.error('Erro ao buscar produto por ID:', error);
      return undefined;
    }
  }, [products, isOffline, setProducts]);

  // Buscar produto por slug
  const getProductBySlug = useCallback(async (slug: string): Promise<Product | undefined> => {
    console.log('Buscando produto por slug:', slug);
    
    // Normalize slug (slug can come with or without encoding)
    const normalizedSlug = decodeURIComponent(slug);
    console.log('Slug normalizado:', normalizedSlug);
    
    // Primeiro, tentamos buscar nos produtos já carregados com slug exato
    const existingProduct = products.find(p => 
      p.slug === normalizedSlug || p.slug === slug
    );
    
    if (existingProduct) {
      console.log('Produto encontrado no estado local com slug exato:', existingProduct);
      return existingProduct;
    }
    
    // Verificamos também correspondências parciais nos produtos em cache
    if (products.length > 0) {
      // Verificar se o slug é parte de um slug de produto (caso tenha havido um sufixo)
      const baseSlug = normalizedSlug.split('-')[0];
      const partialMatch = products.find(p => 
        p.slug.startsWith(baseSlug) || baseSlug.startsWith(p.slug)
      );
      
      if (partialMatch) {
        console.log('Produto encontrado no estado local com correspondência parcial:', partialMatch);
        return partialMatch;
      }
    }
    
    // Se não encontramos e estamos offline, retornamos undefined
    if (isOffline) {
      console.log('Modo offline - produto não encontrado no estado local');
      return undefined;
    }
    
    // Caso contrário, buscamos na API
    try {
      console.log('Produto não encontrado no estado local, buscando na API');
      // Tentar com o slug normalizado primeiro
      let product = await obterProdutoPorSlugAPI(normalizedSlug);
      
      // Se não encontrar, tentar com o slug original
      if (!product && normalizedSlug !== slug) {
        product = await obterProdutoPorSlugAPI(slug);
      }
      
      // Se ainda não encontrou, tentar com o slug base (sem sufixos)
      if (!product && normalizedSlug.includes('-')) {
        const baseSlug = normalizedSlug.split('-')[0];
        product = await obterProdutoPorSlugAPI(baseSlug);
      }
      
      // Se encontramos o produto, adicionamos ao estado local para futuras referências
      if (product) {
        console.log('Produto encontrado na API:', product);
        setProducts(prev => {
          // Verificar se o produto já existe na lista
          if (!prev.some(p => p.id === product.id)) {
            return [...prev, product];
          }
          return prev;
        });
      } else {
        console.log('Produto não encontrado nem na API');
      }
      
      return product;
    } catch (error) {
      console.error('Erro ao buscar produto por slug:', error);
      return undefined;
    }
  }, [products, isOffline, setProducts]);

  // Memoizar os valores retornados para evitar re-renderizações desnecessárias
  return useMemo(() => ({
    addProduct,
    editProduct,
    removeProduct,
    getProductById,
    getProductBySlug
  }), [addProduct, editProduct, removeProduct, getProductById, getProductBySlug]);
};
