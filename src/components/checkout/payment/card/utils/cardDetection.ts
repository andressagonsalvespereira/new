
/**
 * Detecta a bandeira do cartão baseado no número
 * @param cardNumber Número do cartão (com ou sem espaços)
 * @returns Nome da bandeira do cartão
 */
export const detectCardBrand = (cardNumber: string): string => {
  // Remove todos os espaços e caracteres não-numéricos
  const cleanNumber = cardNumber.replace(/\D/g, '');
  
  // Regex para detecção de bandeiras comuns
  const cardPatterns = {
    visa: /^4/,
    mastercard: /^5[1-5]/,
    amex: /^3[47]/,
    elo: /^(4011|4312|4514|5067|5090|5041|5082|5096|509[7-9]|6500|6504|6505|6507|6509|6516|6550|4576|4011)/,
    hipercard: /^(606282|637095|637568|637599|637609|637612)/,
    dinersclub: /^3(?:0[0-5]|[68][0-9])/,
    discover: /^6(?:011|5[0-9]{2})/,
    jcb: /^(?:2131|1800|35\d{3})/,
  };
  
  // Verifica qual padrão corresponde ao número do cartão
  for (const [brand, pattern] of Object.entries(cardPatterns)) {
    if (pattern.test(cleanNumber)) {
      return brand;
    }
  }
  
  return 'unknown';
};

/**
 * Formata o número do cartão inserindo espaços a cada 4 dígitos
 * @param cardNumber Número do cartão sem formatação
 * @returns Número do cartão formatado com espaços
 */
export const formatCardNumber = (cardNumber: string): string => {
  const digits = cardNumber.replace(/\D/g, '');
  const groups = [];
  
  for (let i = 0; i < digits.length; i += 4) {
    groups.push(digits.slice(i, i + 4));
  }
  
  return groups.join(' ');
};

/**
 * Limita o comprimento do número de cartão baseado na bandeira
 * @param cardNumber Número do cartão
 * @returns Número máximo de dígitos permitidos
 */
export const getCardNumberMaxLength = (cardNumber: string): number => {
  const brand = detectCardBrand(cardNumber);
  
  switch (brand) {
    case 'amex':
      return 15;
    case 'dinersclub':
      return 14;
    default:
      return 16;
  }
};
