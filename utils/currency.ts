export const formatCurrency = (amount: number): string => {
  return `ARS ${amount.toLocaleString('es-AR', { 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 0 
  })}`;
};