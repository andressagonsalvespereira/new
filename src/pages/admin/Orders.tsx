import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useOrders } from '@/contexts/OrderContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Eye, Info, Loader2, QrCode } from 'lucide-react';
import { Order, PaymentMethod, PaymentStatus } from '@/types/order';

const OrderStatusBadge = ({ status }: { status: Order['paymentStatus'] }) => {
  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pendente' },
    confirmed: { color: 'bg-green-100 text-green-800', label: 'Confirmado' },
    declined: { color: 'bg-red-100 text-red-800', label: 'Recusado' },
    refunded: { color: 'bg-blue-100 text-blue-800', label: 'Reembolsado' },
    cancelled: { color: 'bg-gray-100 text-gray-800', label: 'Cancelado' },
  };

  const config = statusConfig[status];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};

const OrderDetailsModal = ({ 
  order, 
  isOpen, 
  onClose 
}: { 
  order: Order | null; 
  isOpen: boolean; 
  onClose: () => void;
}) => {
  if (!order) return null;

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Detalhes do Pedido #{order.id.substring(0, 8)}</DialogTitle>
          <DialogDescription>
            Pedido realizado em {formatDate(order.orderDate)}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Dados do Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Nome:</dt>
                  <dd>{order.customer.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">E-mail:</dt>
                  <dd>{order.customer.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">CPF:</dt>
                  <dd>{order.customer.cpf}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Telefone:</dt>
                  <dd>{order.customer.phone}</dd>
                </div>
                {order.customer.address && (
                  <>
                    <div className="pt-2">
                      <dt className="text-sm font-medium text-gray-500">Endereço:</dt>
                      <dd>
                        {order.customer.address.street}, {order.customer.address.number}
                        {order.customer.address.complement && `, ${order.customer.address.complement}`}
                      </dd>
                      <dd>
                        {order.customer.address.neighborhood}, {order.customer.address.city} - {order.customer.address.state}
                      </dd>
                      <dd>CEP: {order.customer.address.postalCode}</dd>
                    </div>
                  </>
                )}
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Dados do Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Produto:</dt>
                  <dd>{order.productName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Preço:</dt>
                  <dd>
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(order.productPrice)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Método de Pagamento:</dt>
                  <dd className="flex items-center">
                    {order.paymentMethod === 'pix' ? (
                      <>
                        <QrCode className="h-4 w-4 mr-1 text-green-600" /> PIX
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-1 text-blue-600" /> Cartão de Crédito
                      </>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status:</dt>
                  <dd><OrderStatusBadge status={order.paymentStatus} /></dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">ID do Pagamento:</dt>
                  <dd>{order.paymentId || 'N/A'}</dd>
                </div>
              </dl>

              {order.paymentMethod === 'card' && order.cardDetails && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="font-medium mb-2">Dados do Cartão</h4>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Número:</dt>
                      <dd>{order.cardDetails.number}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Validade:</dt>
                      <dd>{order.cardDetails.expiryMonth}/{order.cardDetails.expiryYear}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">CVV:</dt>
                      <dd>{order.cardDetails.cvv}</dd>
                    </div>
                    {order.cardDetails.brand && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Bandeira:</dt>
                        <dd>{order.cardDetails.brand}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}

              {order.paymentMethod === 'pix' && order.pixDetails && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="font-medium mb-2">Dados do PIX</h4>
                  {order.paymentStatus === 'pending' && order.pixDetails.qrCodeImage && (
                    <div className="flex justify-center mb-4">
                      <img 
                        src={order.pixDetails.qrCodeImage} 
                        alt="QR Code PIX" 
                        className="w-48 h-48"
                      />
                    </div>
                  )}
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Código PIX:</dt>
                      <dd className="break-all text-xs">{order.pixDetails.qrCode}</dd>
                    </div>
                    {order.pixDetails.expirationDate && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Validade:</dt>
                        <dd>{formatDate(order.pixDetails.expirationDate)}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Orders = () => {
  const { loading, getOrdersByPaymentMethod } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const pixOrders = getOrdersByPaymentMethod('PIX');
  const cardOrders = getOrdersByPaymentMethod('CREDIT_CARD');

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-4" />
          <p className="text-gray-500">Carregando pedidos...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Pedidos</h1>
        <p className="text-muted-foreground">Gerenciamento de todos os pedidos realizados</p>
      </div>

      <Tabs defaultValue="card" className="mb-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="card" className="flex items-center">
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Pedidos via Cartão ({cardOrders.length})</span>
          </TabsTrigger>
          <TabsTrigger value="pix" className="flex items-center">
            <QrCode className="mr-2 h-4 w-4" />
            <span>Pedidos via PIX ({pixOrders.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="card">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos via Cartão de Crédito</CardTitle>
              <CardDescription>
                Lista de todos os pedidos realizados utilizando cartão de crédito
              </CardDescription>
            </CardHeader>
            <CardContent>
              {cardOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Info className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum pedido encontrado</p>
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead>Preço</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Número do Cartão</TableHead>
                        <TableHead>Validade</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cardOrders.map((order) => (
                        <TableRow key={order.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">
                            <div>{order.customer.name}</div>
                            <div className="text-xs text-gray-500">{order.customer.email}</div>
                          </TableCell>
                          <TableCell>{order.productName}</TableCell>
                          <TableCell>{formatCurrency(order.productPrice)}</TableCell>
                          <TableCell>{formatDate(order.orderDate)}</TableCell>
                          <TableCell>{order.cardDetails?.number}</TableCell>
                          <TableCell>
                            {order.cardDetails?.expiryMonth}/{order.cardDetails?.expiryYear}
                          </TableCell>
                          <TableCell>
                            <OrderStatusBadge status={order.paymentStatus} />
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleViewOrder(order)}
                              className="flex items-center text-blue-600 hover:text-blue-800"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Detalhes
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pix">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos via PIX</CardTitle>
              <CardDescription>
                Lista de todos os pedidos realizados utilizando PIX
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pixOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Info className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum pedido encontrado</p>
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead>Preço</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>QR Code</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pixOrders.map((order) => (
                        <TableRow key={order.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">
                            <div>{order.customer.name}</div>
                            <div className="text-xs text-gray-500">{order.customer.email}</div>
                          </TableCell>
                          <TableCell>{order.productName}</TableCell>
                          <TableCell>{formatCurrency(order.productPrice)}</TableCell>
                          <TableCell>{formatDate(order.orderDate)}</TableCell>
                          <TableCell>
                            {order.paymentStatus === 'pending' ? (
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="flex items-center"
                                onClick={() => handleViewOrder(order)}
                              >
                                <QrCode className="h-4 w-4 mr-1 text-green-600" />
                                Ver QR Code
                              </Button>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Pago
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <OrderStatusBadge status={order.paymentStatus} />
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleViewOrder(order)}
                              className="flex items-center text-blue-600 hover:text-blue-800"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Detalhes
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </DashboardLayout>
  );
};

export default Orders;
