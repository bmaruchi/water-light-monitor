
export interface ElectricityReading {
  date: Date;
  reading: number;
  kwh_price: number;
  flag_type: string;
  flag_value: number;
  public_lighting: number;
  days_since_last: number;
}

export interface WaterReading {
  date: Date;
  reading: number;
  days_since_last: number;
}

export const calculateElectricityConsumption = (
  currentReading: number,
  previousReading: number
): number => {
  return Math.max(0, currentReading - previousReading);
};

export const calculateDailyConsumption = (
  consumption: number,
  days: number
): number => {
  if (days <= 0) return 0;
  return consumption / days;
};

export const calculateEstimatedCost = (
  dailyConsumption: number,
  kwhPrice: number,
  flagValue: number,
  publicLighting: number,
  daysToNextReading: number = 30
): number => {
  const estimatedConsumption = dailyConsumption * daysToNextReading;
  const energyCost = estimatedConsumption * kwhPrice;
  const flagCost = estimatedConsumption * flagValue;
  
  return energyCost + flagCost + publicLighting;
};

export const calculateWaterConsumption = (
  currentReading: number,
  previousReading: number
): number => {
  return Math.max(0, currentReading - previousReading);
};

export const calculateEstimatedWaterConsumption = (
  dailyConsumption: number,
  days: number = 30
): number => {
  return dailyConsumption * days;
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatNumber = (value: number, decimals: number = 2): string => {
  return value.toFixed(decimals);
};

export const getRandomData = (length: number, min: number, max: number): number[] => {
  return Array.from({ length }, () => Math.floor(Math.random() * (max - min + 1)) + min);
};

export const getLastMonths = (count: number): string[] => {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const date = new Date();
  const currentMonth = date.getMonth();
  
  const result: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12;
    result.push(months[monthIndex]);
  }
  
  return result;
};
