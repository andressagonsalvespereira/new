
import { logger } from '@/utils/logger';

/**
 * Logs the decision making process for card payment status
 * @param useCustomProcessing Whether product-specific processing is enabled
 * @param productManualStatus The payment status set in product settings
 * @param globalManualStatus The payment status set in global settings
 * @param resolvedStatus The final status that was resolved after applying business rules
 * @returns An object with the decision information
 */
export const logCardProcessingDecisions = (
  useCustomProcessing: boolean,
  productManualStatus: string | undefined,
  globalManualStatus: string | undefined,
  resolvedStatus: string
) => {
  // Determine where the status configuration is coming from
  const statusSource = useCustomProcessing && productManualStatus 
    ? "produto" 
    : globalManualStatus 
      ? "configuração global" 
      : "padrão (ANALYSIS)";
  
  // Determine which value is being used
  const effectiveStatus = useCustomProcessing && productManualStatus 
    ? productManualStatus 
    : globalManualStatus || "ANALYSIS";
  
  logger.log(`Decisão de status de pagamento:
    - Fonte: ${statusSource}
    - Status aplicado: ${resolvedStatus}
    - Status efetivo da configuração: ${effectiveStatus}
    - Configuração do produto habilitada: ${useCustomProcessing ? "Sim" : "Não"}
    - Status configurado no produto: ${productManualStatus || "Não definido"}
    - Status configurado globalmente: ${globalManualStatus || "Não definido"}
  `);
  
  return {
    source: statusSource,
    status: resolvedStatus,
    configuredStatus: effectiveStatus,
    useCustomProcessing,
    productManualStatus,
    globalManualStatus
  };
};
