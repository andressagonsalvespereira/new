
import { Product, CreateProductInput } from '@/types/product';
import { v4 as uuidv4 } from 'uuid';
import { slugify } from './slugUtils';

// Local storage key for products
const LOCAL_STORAGE_KEY = 'cached_products';

// Load products from local storage
export const loadProducts = (): Product[] => {
  try {
    const productsJson = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!productsJson) {
      return [];
    }
    return JSON.parse(productsJson);
  } catch (error) {
    console.error('Error loading products from local storage:', error);
    return [];
  }
};

// Save products to local storage
export const saveProducts = (products: Product[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
  } catch (error) {
    console.error('Error saving products to local storage:', error);
  }
};

// Generate a unique local slug
const generateLocalSlug = (name: string, existingProducts: Product[]): string => {
  let baseSlug = slugify(name);
  let slug = baseSlug;
  let counter = 1;
  
  // Check if slug already exists in local products
  while (existingProducts.some(p => p.slug === slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
};

// Create a product (local version)
export const createProduct = (data: CreateProductInput): Product => {
  const existingProducts = loadProducts();
  const slug = generateLocalSlug(data.name, existingProducts);
  
  const newProduct = {
    id: `local_${uuidv4()}`,
    name: data.name,
    description: data.description,
    price: data.price,
    imageUrl: data.imageUrl,
    isDigital: data.isDigital,
    slug: slug
  };
  
  // Add to local storage
  const products = loadProducts();
  products.unshift(newProduct);
  saveProducts(products);
  
  return newProduct;
};

export const updateExistingProduct = (product: Product, data: CreateProductInput): Product => {
  // If name changed, update slug
  const nameChanged = product.name !== data.name;
  const slug = nameChanged 
    ? generateLocalSlug(data.name, loadProducts().filter(p => p.id !== product.id))
    : product.slug;
  
  return {
    ...product,
    name: data.name,
    description: data.description,
    price: data.price,
    imageUrl: data.imageUrl,
    isDigital: data.isDigital,
    slug: slug
  };
};

// Update product locally
export const updateProduct = (id: string, data: Partial<Product>): Product | undefined => {
  const products = loadProducts();
  const productIndex = products.findIndex(p => p.id === id);
  
  if (productIndex === -1) {
    return undefined;
  }
  
  const currentProduct = products[productIndex];
  
  // If name is changing, update slug
  let updatedSlug = currentProduct.slug;
  if (data.name && data.name !== currentProduct.name) {
    updatedSlug = generateLocalSlug(data.name, products.filter(p => p.id !== id));
  }
  
  const updatedProduct = {
    ...currentProduct,
    ...data,
    slug: data.slug || updatedSlug
  };
  
  products[productIndex] = updatedProduct;
  saveProducts(products);
  
  return updatedProduct;
};

// Delete product locally
export const deleteProduct = (id: string): boolean => {
  const products = loadProducts();
  const newProducts = products.filter(p => p.id !== id);
  
  if (newProducts.length === products.length) {
    return false;
  }
  
  saveProducts(newProducts);
  return true;
};

// Get product by ID locally
export const getProductById = (id: string): Product | undefined => {
  const products = loadProducts();
  return products.find(p => p.id === id);
};

// Get product by slug locally
export const getProductBySlug = (slug: string): Product | undefined => {
  const products = loadProducts();
  return products.find(p => p.slug === slug);
};
