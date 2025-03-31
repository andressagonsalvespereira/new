
import { Product, CreateProductInput, UpdateProductInput } from '@/types/product';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';

// Carrega produtos do Supabase
export const loadProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao carregar produtos:', error);
      throw error;
    }
    
    // Mapear os dados do banco para o formato da aplicação
    return data.map(item => ({
      id: item.id.toString(),
      name: item.name,
      price: Number(item.price),
      description: item.description || undefined,
      imageUrl: item.image_url || undefined,
      isDigital: item.is_digital || false,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
    // Se falhar, retorna um array vazio
    return [];
  }
};

// Salva produtos no Supabase - não é mais necessário, pois o Supabase já persiste os dados
export const saveProducts = async (): Promise<void> => {
  // Esta função não é mais necessária, pois o Supabase já salva os dados no banco
  return;
};

// Cria um novo produto
export const createProduct = async (productData: CreateProductInput): Promise<Product> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: productData.name,
        price: productData.price,
        description: productData.description,
        image_url: productData.imageUrl,
        is_digital: productData.isDigital
      })
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao criar produto:', error);
      throw error;
    }
    
    return {
      id: data.id.toString(),
      name: data.name,
      price: Number(data.price),
      description: data.description || undefined,
      imageUrl: data.image_url || undefined,
      isDigital: data.is_digital || false,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    throw error;
  }
};

// Atualiza um produto existente
export const updateProductData = async (
  products: Product[], 
  productData: UpdateProductInput
): Promise<{ updatedProduct: Product; updatedProducts: Product[] }> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({
        name: productData.name,
        price: productData.price,
        description: productData.description,
        image_url: productData.imageUrl,
        is_digital: productData.isDigital
      })
      .eq('id', productData.id)
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }
    
    const updatedProduct: Product = {
      id: data.id.toString(),
      name: data.name,
      price: Number(data.price),
      description: data.description || undefined,
      imageUrl: data.image_url || undefined,
      isDigital: data.is_digital || false,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
    
    // Atualiza o produto na lista local
    const productIndex = products.findIndex(p => p.id === productData.id);
    const updatedProducts = [...products];
    if (productIndex >= 0) {
      updatedProducts[productIndex] = updatedProduct;
    }
    
    return { updatedProduct, updatedProducts };
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    throw error;
  }
};

// Exclui um produto
export const deleteProductData = async (
  products: Product[], 
  id: string
): Promise<Product[]> => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Erro ao excluir produto:', error);
      throw error;
    }
    
    // Remove o produto da lista local
    return products.filter(product => product.id !== id);
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    throw error;
  }
};

// Encontra um produto pelo ID
export const findProductById = async (
  products: Product[], 
  id: string
): Promise<Product | undefined> => {
  try {
    // Primeiro verifica se o produto está na lista local
    const localProduct = products.find(product => product.id === id);
    if (localProduct) return localProduct;
    
    // Se não estiver na lista local, busca do Supabase
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Produto não encontrado
        return undefined;
      }
      console.error('Erro ao buscar produto:', error);
      throw error;
    }
    
    return {
      id: data.id.toString(),
      name: data.name,
      price: Number(data.price),
      description: data.description || undefined,
      imageUrl: data.image_url || undefined,
      isDigital: data.is_digital || false,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    return undefined;
  }
};
