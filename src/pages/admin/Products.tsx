
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProducts } from '@/contexts/ProductContext';
import { Product, CreateProductInput } from '@/types/product';
import AdminLayout from '@/components/layout/AdminLayout';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [newProductName, setNewProductName] = useState('');
  const [newProductDescription, setNewProductDescription] = useState('');
  const [newProductPrice, setNewProductPrice] = useState(0);
  const [newProductImageUrl, setNewProductImageUrl] = useState('');
  const [newProductIsDigital, setNewProductIsDigital] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editedProductName, setEditedProductName] = useState('');
  const [editedProductDescription, setEditedProductDescription] = useState('');
  const [editedProductPrice, setEditedProductPrice] = useState(0);
  const [editedProductImageUrl, setEditedProductImageUrl] = useState('');
  const [editedProductIsDigital, setEditedProductIsDigital] = useState(false);
  const { toast } = useToast();
  const { addProduct, updateProduct, deleteProduct, products: contextProducts, loading, error } = useProducts();
  const navigate = useNavigate();

  useEffect(() => {
    if (contextProducts && contextProducts.length > 0) {
      setProducts(contextProducts);
    } else {
      fetchProducts();
    }
  }, [contextProducts]);

  const fetchProducts = async () => {
    try {
      // This works because we've updated the ProductContextType to include getProducts
      const productList = contextProducts;
      setProducts(productList);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar produtos. Verifique sua conexão com o banco de dados.",
        variant: "destructive",
      });
    }
  };

  const handleAddProduct = async () => {
    try {
      const newProduct: CreateProductInput = {
        name: newProductName,
        description: newProductDescription,
        price: newProductPrice,
        imageUrl: newProductImageUrl,
        isDigital: newProductIsDigital
      };
      
      const createdProduct = await addProduct(newProduct);
      setProducts([...products, createdProduct]);
      
      // Reset form fields
      setNewProductName('');
      setNewProductDescription('');
      setNewProductPrice(0);
      setNewProductImageUrl('');
      setNewProductIsDigital(false);

      toast({
        title: "Sucesso",
        description: "Produto adicionado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
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
      setEditedProductIsDigital(productToEdit.isDigital);
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProductId) return;

    try {
      const updatedProduct: CreateProductInput = {
        name: editedProductName,
        description: editedProductDescription,
        price: editedProductPrice,
        imageUrl: editedProductImageUrl,
        isDigital: editedProductIsDigital
      };
      
      await updateProduct(editingProductId, updatedProduct);

      const updatedProducts = products.map(product =>
        product.id === editingProductId
          ? {
              ...product,
              name: editedProductName,
              description: editedProductDescription,
              price: editedProductPrice,
              imageUrl: editedProductImageUrl,
              isDigital: editedProductIsDigital
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
      console.error('Erro ao atualizar produto:', error);
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
      console.error('Erro ao remover produto:', error);
      toast({
        title: "Erro",
        description: "Falha ao remover produto",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="container py-6">
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
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isDigital"
                  checked={newProductIsDigital}
                  onCheckedChange={(checked) => setNewProductIsDigital(!!checked)}
                />
                <Label htmlFor="isDigital">Produto Digital</Label>
              </div>
              <Button onClick={handleAddProduct} className="bg-green-600 hover:bg-green-700">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Produto
              </Button>
            </div>
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Lista de Produtos</h2>
              {loading ? (
                <p className="text-center py-4">Carregando produtos...</p>
              ) : error ? (
                <p className="text-center py-4 text-red-600">Erro ao carregar produtos: {error}</p>
              ) : products.length === 0 ? (
                <p className="text-center py-4 text-gray-500">Nenhum produto cadastrado</p>
              ) : (
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipo
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
                              `R$ ${product.price.toFixed(2)}`
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingProductId === product.id ? (
                              <Input
                                value={editedProductImageUrl}
                                onChange={(e) => setEditedProductImageUrl(e.target.value)}
                              />
                            ) : (
                              <div className="h-10 w-10 overflow-hidden rounded-md">
                                {product.imageUrl ? (
                                  <img 
                                    src={product.imageUrl} 
                                    alt={product.name} 
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-xs text-gray-500">No image</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingProductId === product.id ? (
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  checked={editedProductIsDigital}
                                  onCheckedChange={(checked) => setEditedProductIsDigital(!!checked)}
                                />
                                <span>Digital</span>
                              </div>
                            ) : (
                              <span className={`px-2 py-1 text-xs rounded-full ${product.isDigital ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                {product.isDigital ? 'Digital' : 'Físico'}
                              </span>
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
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Products;
