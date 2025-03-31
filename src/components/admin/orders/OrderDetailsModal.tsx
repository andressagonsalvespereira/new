
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CreditCard, QrCode } from 'lucide-react';
import { Order } from '@/types/order';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import OrderStatusBadge from './OrderStatusBadge';

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ 
  order, 
  isOpen, 
  onClose 
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
                    {order.paymentMethod === 'PIX' ? (
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

              {order.paymentMethod === 'CREDIT_CARD' && order.cardDetails && (
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

              {order.paymentMethod === 'PIX' && order.pixDetails && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="font-medium mb-2">Dados do PIX</h4>
                  {order.paymentStatus === 'Aguardando' && order.pixDetails.qrCodeImage && (
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

export default OrderDetailsModal;
