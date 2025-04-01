
export interface ProductDetailsType {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  isDigital: boolean;
}

export const getProductDetails = (slug?: string): ProductDetailsType => {
  // This is a mock function that should be replaced with a real API call
  // You would typically fetch product details from an API based on the slug
  
  // Default product
  const defaultProduct: ProductDetailsType = {
    id: 'prod-001',
    name: 'Produto Demo',
    price: 99.90,
    description: 'Este é um produto de demonstração para o checkout.',
    image: '/placeholder.svg',
    isDigital: false,
  };
  
  // Mock products based on slug
  const products: Record<string, ProductDetailsType> = {
    'assinatura-mensal-cineflick-card': {
      id: 'prod-cineflick',
      name: 'Assinatura Mensal CineFlick',
      price: 19.90,
      description: 'Acesso a todos os filmes e séries por 1 mês',
      image: '/placeholder.svg',
      isDigital: true,
    },
    'product-demo': {
      id: 'prod-demo',
      name: 'Produto de Demonstração',
      price: 59.90,
      description: 'Este é um produto físico de demonstração para testar o checkout.',
      image: '/placeholder.svg',
      isDigital: false,
    },
  };
  
  // Return product details based on slug, or default if not found
  return slug && products[slug] ? products[slug] : defaultProduct;
};

export default getProductDetails;
