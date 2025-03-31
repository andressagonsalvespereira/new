
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isDigital: boolean;
}

export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isDigital: boolean;
}

export interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  addProduct: (product: CreateProductInput) => Promise<Product>;
  updateProduct: (id: string, product: CreateProductInput) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  getProductById: (id: string) => Promise<Product | null>;
  getProducts: () => Promise<Product[]>;
}
