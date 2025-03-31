
import { Product, CreateProductInput } from '@/types/product';
import { v4 as uuidv4 } from 'uuid';

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

// Create a product (local version)
export const createProduct = (data: CreateProductInput): Product => {
  const newProduct = {
    id: `local_${uuidv4()}`,
    name: data.name,
    description: data.description,
    price: data.price,
    imageUrl: data.imageUrl,
    isDigital: data.isDigital
  };
  
  // Add to local storage
  const products = loadProducts();
  products.unshift(newProduct);
  saveProducts(products);
  
  return newProduct;
};

export const updateExistingProduct = (product: Product, data: CreateProductInput): Product => {
  return {
    ...product,
    name: data.name,
    description: data.description,
    price: data.price,
    imageUrl: data.imageUrl,
    isDigital: data.isDigital
  };
};

// Update product locally
export const updateProduct = (id: string, data: Partial<Product>): Product | undefined => {
  const products = loadProducts();
  const productIndex = products.findIndex(p => p.id === id);
  
  if (productIndex === -1) {
    return undefined;
  }
  
  const updatedProduct = {
    ...products[productIndex],
    ...data,
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
