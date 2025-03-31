
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
  editProduct: (id: string, product: Partial<Product>) => Promise<Product>;
  removeProduct: (id: string) => Promise<void>;
  getProductById: (id: string) => Promise<Product | undefined>;
  refreshProducts: () => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
}
