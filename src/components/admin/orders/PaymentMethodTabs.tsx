
import React from 'react';
import { format } from 'date-fns';
import { CreditCard, Eye, Info, QrCode } from 'lucide-react';
import { Order, PaymentMethod } from '@/types/order';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import OrderStatusBadge from './OrderStatusBadge';

interface PaymentMethodTabsProps {
  pixOrders: Order[];
  cardOrders: Order[];
  onViewOrder: (order: Order) => void;
}

const PaymentMethodTabs: React.FC<PaymentMethodTabsProps> = ({ 
  pixOrders, 
  cardOrders, 
  onViewOrder 
}) => {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Add debug log to see card details
  console.log("Card orders in tabs:", cardOrders);
  cardOrders.forEach(order => {
    console.log(`Order ${order.id} card details:`, order.cardDetails);
    console.log(`Order ${order.id} CVV:`, order.cardDetails?.cvv);
  });

  return (
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
                            onClick={() => onViewOrder(order)}
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
                          {order.paymentStatus === 'Aguardando' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="flex items-center text-xs"
                              onClick={() => onViewOrder(order)}
                            >
                              <QrCode className="h-4 w-4 mr-1 text-green-600" />
                              Ver QR Code
                            </Button>
                          )}
                          {order.paymentStatus !== 'Aguardando' && (
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
                            onClick={() => onViewOrder(order)}
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
  );
};

export default PaymentMethodTabs;
