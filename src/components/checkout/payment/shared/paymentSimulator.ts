
/**
 * Simulador de pagamentos para ambiente de desenvolvimento
 * Este arquivo contém funções para simular processamento de pagamentos
 * quando não estamos em ambiente de produção
 */

/**
 * Simula a criação de um cliente
 */
export const simulateCustomerCreation = async () => {
  // Simular atraso de rede
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Retornar um ID de cliente simulado
  return { id: 'cus_' + Math.random().toString(36).substring(2, 11) };
};

/**
 * Simula o processamento de pagamento com cartão
 * @param successRate Taxa de sucesso (entre 0 e 1)
 */
export const simulateCardPayment = async (successRate = 0.7) => {
  // Simular atraso de rede para processamento
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simular um pagamento bem-sucedido ou falho baseado na taxa de sucesso
  const isSuccessful = Math.random() < successRate;
  
  return { 
    id: 'pay_' + Math.random().toString(36).substring(2, 11),
    status: isSuccessful ? 'CONFIRMED' : 'DECLINED',
    creditCard: {
      creditCardBrand: 'VISA'
    }
  };
};

/**
 * Simula a geração de um QR code PIX
 */
export const simulatePixQrCodeGeneration = async () => {
  // Simular atraso de rede
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Retornar dados simulados de QR code PIX
  return {
    qrCode: '00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-426655440000',
    qrCodeImage: 'https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-426655440000',
    expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    paymentId: 'pay_' + Math.random().toString(36).substring(2, 11)
  };
};

/**
 * Simula o processamento completo de um pagamento
 * Esta função combina as operações de simulação para fornecer um resultado completo
 */
export const simulatePayment = async (successRate = 0.85) => {
  // Simular atraso de rede para processamento
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Determinar se o pagamento foi bem-sucedido
  const success = Math.random() < successRate;
  
  // Gerar ID de pagamento
  const paymentId = 'pay_' + Math.random().toString(36).substring(2, 11);
  
  return {
    success,
    paymentId,
    error: success ? null : 'Falha no processamento do pagamento',
    timestamp: new Date().toISOString()
  };
};
