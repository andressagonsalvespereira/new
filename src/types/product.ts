
export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  isDigital: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  isDigital: boolean;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  id: string;
}
