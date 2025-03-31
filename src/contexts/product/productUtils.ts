
import { Product, CreateProductInput } from '@/types/product';
import { supabase } from '@/integrations/supabase/client';

// Helper function to convert database product to frontend Product type
const convertDBProductToProduct = (dbProduct: any): Product => {
  return {
    id: dbProduct.id.toString(),
    name: dbProduct.name,
    price: dbProduct.price,
    description: dbProduct.description || '',
    imageUrl: dbProduct.image_url || '',
    isDigital: dbProduct.is_digital || false,
    createdAt: new Date(dbProduct.created_at).toISOString(),
    updatedAt: new Date(dbProduct.updated_at).toISOString(),
  };
};

// Load all products from the database
export const loadProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error loading products: ${error.message}`);
    }

    return data.map(convertDBProductToProduct);
  } catch (error) {
    console.error('Failed to load products:', error);
    throw error;
  }
};

// Create a new product
export const createProduct = async (productData: CreateProductInput): Promise<Product> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: productData.name,
        price: productData.price,
        description: productData.description || null,
        image_url: productData.imageUrl || null,
        is_digital: productData.isDigital || false,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating product: ${error.message}`);
    }

    return convertDBProductToProduct(data);
  } catch (error) {
    console.error('Failed to create product:', error);
    throw error;
  }
};

// Get a product by ID
export const getProductById = async (id: string): Promise<Product | undefined> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', parseInt(id, 10))
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        return undefined;
      }
      throw new Error(`Error getting product: ${error.message}`);
    }

    return convertDBProductToProduct(data);
  } catch (error) {
    console.error(`Failed to get product with id ${id}:`, error);
    throw error;
  }
};

// Update an existing product
export const updateProduct = async (id: string, productData: Partial<Product>): Promise<Product> => {
  try {
    // Convert frontend data format to database format
    const dbData: any = {};
    if (productData.name !== undefined) dbData.name = productData.name;
    if (productData.price !== undefined) dbData.price = productData.price;
    if (productData.description !== undefined) dbData.description = productData.description;
    if (productData.imageUrl !== undefined) dbData.image_url = productData.imageUrl;
    if (productData.isDigital !== undefined) dbData.is_digital = productData.isDigital;
    
    // Always update the updated_at timestamp
    dbData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('products')
      .update(dbData)
      .eq('id', parseInt(id, 10))
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating product: ${error.message}`);
    }

    return convertDBProductToProduct(data);
  } catch (error) {
    console.error(`Failed to update product with id ${id}:`, error);
    throw error;
  }
};

// Delete a product
export const deleteProduct = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', parseInt(id, 10));

    if (error) {
      throw new Error(`Error deleting product: ${error.message}`);
    }
  } catch (error) {
    console.error(`Failed to delete product with id ${id}:`, error);
    throw error;
  }
};
