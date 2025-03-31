
import { Product, CreateProductInput } from '@/types/product';
import { supabase } from '@/integrations/supabase/client';
import { generateSlug } from './slugUtils';

// Interface para o tipo de dado retornado pelo Supabase
interface SupabaseProductRow {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_digital: boolean;
  slug: string;
  created_at: string;
  updated_at: string;
  use_custom_processing: boolean | null;
  manual_card_status: string | null;
}

// Fetch products from Supabase
export const fetchProductsFromAPI = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  // Map database format to our Product type
  return (data as SupabaseProductRow[]).map(item => ({
    id: String(item.id), // Convert to string
    name: item.name,
    description: item.description || '',
    price: Number(item.price),
    imageUrl: item.image_url || '',
    isDigital: item.is_digital || false,
    slug: item.slug,
    useCustomProcessing: item.use_custom_processing || false,
    manualCardStatus: item.manual_card_status || null
  }));
};

// Add product to Supabase
export const addProductToAPI = async (productData: CreateProductInput): Promise<Product> => {
  // Generate a slug based on the product name
  const slug = await generateSlug(productData.name);
  
  // Transform our product data to match database schema
  const dbProductData = {
    name: productData.name,
    description: productData.description,
    price: productData.price,
    image_url: productData.imageUrl,
    is_digital: productData.isDigital,
    slug: slug,
    use_custom_processing: productData.useCustomProcessing || false,
    manual_card_status: productData.manualCardStatus || null
  };
  
  const { data, error } = await supabase
    .from('products')
    .insert([dbProductData])
    .select()
    .single();
  
  if (error) throw error;
  
  // Convert back to our Product type
  const product = data as SupabaseProductRow;
  
  return {
    id: String(product.id),
    name: product.name,
    description: product.description || '',
    price: Number(product.price),
    imageUrl: product.image_url || '',
    isDigital: product.is_digital || false,
    slug: product.slug,
    useCustomProcessing: product.use_custom_processing || false,
    manualCardStatus: product.manual_card_status || null
  };
};

// Edit product in Supabase
export const editProductInAPI = async (id: string, productData: Partial<Product>): Promise<Product> => {
  // Transform our product data to match database schema
  const dbProductData: any = {};
  
  if (productData.name !== undefined) {
    dbProductData.name = productData.name;
    // Re-generate slug if name changes
    dbProductData.slug = await generateSlug(productData.name);
  }
  if (productData.description !== undefined) dbProductData.description = productData.description;
  if (productData.price !== undefined) dbProductData.price = productData.price;
  if (productData.imageUrl !== undefined) dbProductData.image_url = productData.imageUrl;
  if (productData.isDigital !== undefined) dbProductData.is_digital = productData.isDigital;
  if (productData.slug !== undefined) dbProductData.slug = productData.slug;
  if (productData.useCustomProcessing !== undefined) dbProductData.use_custom_processing = productData.useCustomProcessing;
  if (productData.manualCardStatus !== undefined) dbProductData.manual_card_status = productData.manualCardStatus;
  
  // Update product in Supabase
  const { data, error } = await supabase
    .from('products')
    .update(dbProductData)
    .eq('id', parseInt(id)) // Convert string id to number
    .select()
    .single();
  
  if (error) throw error;
  
  // Convert to our Product type
  const product = data as SupabaseProductRow;
  
  return {
    id: String(product.id),
    name: product.name,
    description: product.description || '',
    price: Number(product.price),
    imageUrl: product.image_url || '',
    isDigital: product.is_digital || false,
    slug: product.slug,
    useCustomProcessing: product.use_custom_processing || false,
    manualCardStatus: product.manual_card_status || null
  };
};

// Remove product from Supabase
export const removeProductFromAPI = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', parseInt(id)); // Convert string id to number
  
  if (error) throw error;
};

// Get product by ID from Supabase
export const getProductByIdFromAPI = async (id: string): Promise<Product | undefined> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', parseInt(id)) // Convert string id to number
    .maybeSingle();
  
  if (error) throw error;
  if (!data) return undefined;
  
  // Convert to our Product type
  const product = data as SupabaseProductRow;
  
  return {
    id: String(product.id),
    name: product.name,
    description: product.description || '',
    price: Number(product.price),
    imageUrl: product.image_url || '',
    isDigital: product.is_digital || false,
    slug: product.slug,
    useCustomProcessing: product.use_custom_processing || false,
    manualCardStatus: product.manual_card_status || null
  };
};

// Get product by slug from Supabase
export const getProductBySlugFromAPI = async (slug: string): Promise<Product | undefined> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  
  if (error) throw error;
  if (!data) return undefined;
  
  // Convert to our Product type
  const product = data as SupabaseProductRow;
  
  return {
    id: String(product.id),
    name: product.name,
    description: product.description || '',
    price: Number(product.price),
    imageUrl: product.image_url || '',
    isDigital: product.is_digital || false,
    slug: product.slug,
    useCustomProcessing: product.use_custom_processing || false,
    manualCardStatus: product.manual_card_status || null
  };
};
