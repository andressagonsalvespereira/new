import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProducts } from '@/contexts/ProductContext';
import { Product } from '@/types/product';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [newProductName, setNewProductName] = useState('');
  const [newProductDescription, setNewProductDescription] = useState('');
  const [newProductPrice, setNewProductPrice] = useState(0);
  const [newProductImageUrl, setNewProductImageUrl] = useState('');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editedProductName, setEditedProductName] = useState('');
  const [editedProductDescription, setEditedProductDescription] = useState('');
  const [editedProductPrice, setEditedProductPrice] = useState(0);
  const [editedProductImageUrl, setEditedProductImageUrl] = useState('');
  const { toast } = useToast();
  const { addProduct, getProducts, updateProduct, deleteProduct } = useProducts();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const productList = await getProducts();
      setProducts(productList);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar produtos",
        variant: "destructive",
      });
    }
  };

  const handleAddProduct = async () => {
    try {
      const newProduct = await addProduct({
        name: newProductName,
        description: newProductDescription,
        price: newProductPrice,
        imageUrl: newProductImageUrl,
        isDigital: false // Default value for isDigital
      });

      setProducts([...products, newProduct]);
      setNewProductName('');
      setNewProductDescription('');
      setNewProductPrice(0);
      setNewProductImageUrl('');

      toast({
        title: "Sucesso",
        description: "Produto adicionado com sucesso",
      });
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Erro",
        description: "Falha ao adicionar produto",
        variant: "destructive",
      });
    }
  };

  const handleEditProduct = (id: string) => {
    const productToEdit = products.find(product => product.id === id);
    if (productToEdit) {
      setEditingProductId(id);
      setEditedProductName(productToEdit.name);
      setEditedProductDescription(productToEdit.description);
      setEditedProductPrice(productToEdit.price);
      setEditedProductImageUrl(productToEdit.imageUrl);
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProductId) return;

    try {
      await updateProduct(editingProductId, {
        name: editedProductName,
        description: editedProductDescription,
        price: editedProductPrice,
        imageUrl: editedProductImageUrl,
        isDigital: products.find(p => p.id === editingProductId)?.isDigital || false
      });

      const updatedProducts = products.map(product =>
        product.id === editingProductId
          ? {
              ...product,
              name: editedProductName,
              description: editedProductDescription,
              price: editedProductPrice,
              imageUrl: editedProductImageUrl,
            }
          : product
      );

      setProducts(updatedProducts);
      setEditingProductId(null);

      toast({
        title: "Sucesso",
        description: "Produto atualizado com sucesso",
      });
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar produto",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct(id);
      setProducts(products.filter(product => product.id !== id));

      toast({
        title: "Sucesso",
        description: "Produto removido com sucesso",
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Erro",
        description: "Falha ao remover produto",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Gerenciar Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome do Produto</Label>
                <Input
                  id="name"
                  placeholder="Nome do produto"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  placeholder="Descrição do produto"
                  value={newProductDescription}
                  onChange={(e) => setNewProductDescription(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Preço</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="Preço"
                  value={newProductPrice}
                  onChange={(e) => setNewProductPrice(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="imageUrl">URL da Imagem</Label>
                <Input
                  id="imageUrl"
                  placeholder="URL da imagem"
                  value={newProductImageUrl}
                  onChange={(e) => setNewProductImageUrl(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={handleAddProduct} className="bg-green-600 hover:bg-green-700">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Produto
            </Button>
          </div>
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Lista de Produtos</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descrição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Preço
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Imagem
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingProductId === product.id ? (
                          <Input
                            value={editedProductName}
                            onChange={(e) => setEditedProductName(e.target.value)}
                          />
                        ) : (
                          product.name
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingProductId === product.id ? (
                          <Input
                            value={editedProductDescription}
                            onChange={(e) => setEditedProductDescription(e.target.value)}
                          />
                        ) : (
                          product.description
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingProductId === product.id ? (
                          <Input
                            type="number"
                            value={editedProductPrice}
                            onChange={(e) => setEditedProductPrice(Number(e.target.value))}
                          />
                        ) : (
                          product.price
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingProductId === product.id ? (
                          <Input
                            value={editedProductImageUrl}
                            onChange={(e) => setEditedProductImageUrl(e.target.value)}
                          />
                        ) : (
                          product.imageUrl
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {editingProductId === product.id ? (
                          <div className="space-x-2">
                            <Button
                              onClick={handleUpdateProduct}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                            >
                              Salvar
                            </Button>
                            <Button
                              onClick={() => setEditingProductId(null)}
                              variant="ghost"
                              className="text-gray-500 hover:text-gray-700 text-xs"
                            >
                              Cancelar
                            </Button>
                          </div>
                        ) : (
                          <div className="space-x-2">
                            <Button
                              onClick={() => handleEditProduct(product.id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </Button>
                            <Button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="bg-red-600 hover:bg-red-700 text-white text-xs"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Products;
