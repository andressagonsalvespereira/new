
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Copy, ArrowLeft } from 'lucide-react';
import CheckoutLayout from '@/components/checkout/CheckoutLayout';
import { useToast } from '@/hooks/use-toast';

// Define interface for props
interface CheckoutHeaderProps {
  title?: string;
  productName?: string;
}

const PixPaymentManual: React.FC = () => {
  const location = useLocation();
  const { toast } = useToast();
  
  // Get data from location state
  const orderData = location.state?.orderData || {};
  const productName = orderData.productName || 'Produto';
  const pixCode = "00020126580014BR.GOV.BCB.PIX0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***63041D3D";

  const handleCopyPixCode = () => {
    navigator.clipboard.writeText(pixCode)
      .then(() => {
        toast({
          title: "Código PIX copiado!",
          description: "O código PIX foi copiado para a área de transferência.",
          duration: 3000,
        });
      })
      .catch((error) => {
        console.error('Erro ao copiar código PIX:', error);
        toast({
          title: "Erro ao copiar",
          description: "Não foi possível copiar o código PIX. Tente novamente.",
          variant: "destructive",
          duration: 5000,
        });
      });
  };

  return (
    <CheckoutLayout>
      {/* Use proper props instead of any */}
      <CheckoutHeader title="Pagamento via PIX" />
      
      <div className="max-w-lg mx-auto p-4">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-xl">Pagamento via PIX</CardTitle>
            <CardDescription className="text-center">
              Escaneie o QR Code abaixo ou copie o código PIX para pagar
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6">
            <div className="p-4 rounded-lg border border-gray-200 bg-white">
              <div className="w-48 h-48 flex items-center justify-center bg-gray-100">
                <QrCode className="w-24 h-24 text-gray-400" />
              </div>
            </div>
            
            <div className="w-full">
              <p className="text-sm text-gray-500 mb-2">Código PIX:</p>
              <div className="flex">
                <div className="flex-1 p-2 bg-gray-100 rounded-l-md border border-gray-200 text-xs overflow-hidden break-all">
                  {pixCode}
                </div>
                <Button 
                  onClick={handleCopyPixCode}
                  className="rounded-l-none bg-blue-600 hover:bg-blue-700"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm font-medium">Produto: {productName}</p>
              <p className="text-sm text-gray-500">
                Assim que o pagamento for confirmado, você receberá um email com os detalhes.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              onClick={handleCopyPixCode}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Copiar Código PIX
            </Button>
            <Link to="/" className="w-full">
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para a Página Inicial
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </CheckoutLayout>
  );
};

// Define CheckoutHeader component with proper props
const CheckoutHeader: React.FC<CheckoutHeaderProps> = ({ title }) => {
  return (
    <div className="bg-white border-b py-4">
      <div className="container mx-auto px-4">
        <h1 className="text-xl font-bold text-center">{title}</h1>
      </div>
    </div>
  );
};

export default PixPaymentManual;
