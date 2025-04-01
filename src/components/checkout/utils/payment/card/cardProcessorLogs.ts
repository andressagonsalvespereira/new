
// Esta função pode ser importada em outros arquivos para diagnosticar problemas
export const logCardProcessingDecisions = (
  useCustomProcessing: boolean,
  productManualStatus: string | undefined,
  globalManualStatus: string | undefined
) => {
  // Determinar de onde está vindo a configuração de status
  const statusSource = useCustomProcessing && productManualStatus 
    ? "produto" 
    : globalManualStatus 
      ? "configuração global" 
      : "padrão (ANALYSIS)";
  
  // Determinar qual valor está sendo usado
  const effectiveStatus = useCustomProcessing && productManualStatus 
    ? productManualStatus 
    : globalManualStatus || "ANALYSIS";
  
  console.log(`Decisão de status de pagamento:
    - Fonte: ${statusSource}
    - Status aplicado: ${effectiveStatus}
    - Configuração do produto habilitada: ${useCustomProcessing ? "Sim" : "Não"}
    - Status configurado no produto: ${productManualStatus || "Não definido"}
    - Status configurado globalmente: ${globalManualStatus || "Não definido"}
  `);
  
  return {
    source: statusSource,
    status: effectiveStatus,
    useCustomProcessing,
    productManualStatus,
    globalManualStatus
  };
};
