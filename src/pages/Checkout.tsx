
import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProducts } from '@/contexts/ProductContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';
import { Product } from '@/types/product';

const Checkout: React.FC = () => {
  const { productId } = useParams();
  const { getProductById } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setLoading(false);
        return;
      }
      
      try {
        const product = await getProductById(productId);
        setSelectedProduct(product || null);
      } catch (error) {
        console.error('Erro ao buscar produto:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [productId, getProductById]);

  // Ajustando como acessamos as propriedades do produto que agora usam nomenclatura em português
  const productDetails = useMemo(() => {
    if (!selectedProduct) return null;
    
    return {
      name: selectedProduct.nome, // mudado de name para nome
      price: selectedProduct.preco, // mudado de price para preco
      description: selectedProduct.descricao, // mudado de description para descricao
      imageUrl: selectedProduct.urlImagem, // mudado de imageUrl para urlImagem
      isDigital: selectedProduct.digital // mudado de isDigital para digital
    };
  }, [selectedProduct]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Carregando...
      </div>
    );
  }

  if (!productDetails) {
    return (
      <div className="flex justify-center items-center h-screen">
        Produto não encontrado.
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-10">
      <div className="flex shadow-md my-10">
        <div className="w-3/4 bg-white px-10 py-10">
          <div className="flex justify-between border-b pb-8">
            <h1 className="font-semibold text-2xl">Resumo da Compra</h1>
            <h2 className="font-semibold text-2xl">1 Item</h2>
          </div>
          <div className="flex mt-10 mb-5">
            <h3 className="font-semibold text-gray-600 text-xs uppercase w-2/5">Detalhes do Produto</h3>
            <h3 className="font-semibold text-center text-gray-600 text-xs uppercase w-1/5 text-center">
              Quantidade
            </h3>
            <h3 className="font-semibold text-center text-gray-600 text-xs uppercase w-1/5 text-center">
              Preço
            </h3>
            <h3 className="font-semibold text-center text-gray-600 text-xs uppercase w-1/5 text-center">
              Total
            </h3>
          </div>

          <div className="flex items-center hover:bg-gray-100 -mx-8 px-6 py-5">
            <div className="flex w-2/5">
              <div className="w-20">
                {productDetails.imageUrl && (
                  <img
                    src={productDetails.imageUrl}
                    alt={productDetails.name}
                    className="object-contain w-20 h-20"
                  />
                )}
              </div>
              <div className="flex flex-col justify-between ml-4 flex-grow">
                <span className="font-bold text-sm">{productDetails.name}</span>
                <span className="text-red-500 text-xs">{productDetails.description}</span>
                <div className="font-semibold hover:text-red-500 text-gray-500 text-xs cursor-pointer">
                  Remover
                </div>
              </div>
            </div>
            <div className="flex justify-center w-1/5">
              <svg className="fill-current text-gray-600 w-3 cursor-pointer">
                <path d="M15 19l-2-3H7l-2 3H3v2h12v-2zm0-12h-2L9 9H7L5 5H3v2h12V5zM5 11l2 3h6l2-3H5z" />
              </svg>

              <input
                className="mx-2 border text-center w-8"
                type="text"
                value="1"
                readOnly
              />

              <svg className="fill-current text-gray-600 w-3 cursor-pointer">
                <path d="M5 5l2 3h6l2-3H5zm0 6l2 3h6l2-3H5zm0 6l2 3h6l2-3H5zm10-10h-2L9 9H7L5 5H3v2h12V5zM5 11l2 3h6l2-3H5zm10 8h-2l-4-6h-4l-2 3H3v2h12v-2z" />
              </svg>
            </div>
            <span className="text-center w-1/5 font-semibold text-sm">
              R$ {productDetails.price.toFixed(2)}
            </span>
            <span className="text-center w-1/5 font-semibold text-sm">
              R$ {productDetails.price.toFixed(2)}
            </span>
          </div>

          <Link
            to="/"
            className="flex font-semibold text-indigo-600 text-sm mt-10"
          >
            <svg
              className="fill-current text-indigo-600 w-4 mr-2"
              viewBox="0 0 448 512"
            >
              <path d="M134.059 296H436c6.627 0 12-5.373 12-12v-56c0-6.627-5.373-12-12-12H134.059v-46.059c0-21.382-25.851-32.09-40.971-16.971L7.029 239.029c-9.373 9.373-9.373 24.569 0 33.941l86.059 86.059c15.119 15.119 40.971 4.411 40.971-16.971V296z" />
            </svg>
            Continuar Comprando
          </Link>
        </div>

        <div id="summary" className="w-1/4 px-8 py-10">
          <h1 className="font-semibold text-2xl border-b pb-8">
            Resumo do Pedido
          </h1>
          <div className="flex justify-between mt-10 mb-5">
            <span className="font-semibold text-sm uppercase">
              Itens {1}
            </span>
            <span className="font-semibold text-sm">
              R$ {productDetails.price.toFixed(2)}
            </span>
          </div>
          <div>
            <label className="font-medium inline-block mb-3 text-sm uppercase">
              Frete
            </label>
            <select className="block p-2 text-gray-600 w-full text-sm">
              <option>Entrega padrão - R$5.00</option>
            </select>
          </div>
          <div className="py-10">
            <label
              htmlFor="promo"
              className="font-semibold inline-block mb-3 text-sm uppercase"
            >
              Código promocional
            </label>
            <input
              type="text"
              id="promo"
              placeholder="Insira seu código"
              className="p-2 text-sm w-full"
            />
          </div>
          <button className="bg-red-500 hover:bg-red-600 px-5 py-2 text-sm text-white uppercase">
            Aplicar
          </button>
          <div className="border-t mt-8">
            <div className="flex font-semibold justify-between py-6 text-sm uppercase">
              <span>Custo total</span>
              <span>R$ {(productDetails.price + 5).toFixed(2)}</span>
            </div>
            <button className="bg-indigo-500 font-semibold hover:bg-indigo-600 py-3 text-sm text-white uppercase w-full">
              Finalizar compra
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
