
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isDigital: boolean;
  slug: string;
  useCustomProcessing?: boolean;
  manualCardStatus?: string;
}

export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isDigital: boolean;
  useCustomProcessing?: boolean;
  manualCardStatus?: string;
}
