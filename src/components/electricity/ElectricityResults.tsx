
import React from 'react';
import { formatNumber, formatCurrency } from '@/lib/calculations';
import ReportActions from '@/components/ReportActions';

interface ElectricityResultsProps {
  consumption: number | null;
  daysSinceLastReading: number;
  dailyConsumption: number | null;
  estimatedCost: number | null;
  flagType: string;
  flagValues: Record<string, { name: string; value: number }>;
  isEditing: boolean;
  currentMonthName: string;
  currentYear: number;
  previousReading: string;
}

const ElectricityResults: React.FC<ElectricityResultsProps> = ({
  consumption,
  daysSinceLastReading,
  dailyConsumption,
  estimatedCost,
  flagType,
  flagValues,
  isEditing,
  currentMonthName,
  currentYear,
  previousReading
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Consumo Atual</p>
          <p className="text-2xl font-bold">
            {consumption ? `${formatNumber(consumption)} kWh` : "falta dados"}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Dias desde última leitura</p>
          <p className="text-2xl font-bold">{daysSinceLastReading}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Consumo Diário</p>
          <p className="text-2xl font-bold">
            {dailyConsumption ? `${formatNumber(dailyConsumption)} kWh` : "falta dados"}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Valor da Bandeira</p>
          <p className="text-2xl font-bold">
            {`R$ ${flagValues[flagType].value.toFixed(5)}/kWh`}
          </p>
        </div>
      </div>

      <div>
        <p className="text-sm text-muted-foreground mb-1">Previsão para 30 dias</p>
        <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
          {estimatedCost ? formatCurrency(estimatedCost) : "falta dados"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Baseado no consumo diário atual
        </p>
      </div>

      <div className="pt-4">
        <p className="text-sm font-medium">Dicas de Economia:</p>
        <ul className="text-sm text-muted-foreground list-disc pl-5 pt-2 space-y-1">
          <li>Substitua lâmpadas por modelos LED</li>
          <li>Desligue aparelhos em modo standby</li>
          <li>Utilize ar-condicionado em temperatura moderada</li>
        </ul>
      </div>

      {/* Report Actions */}
      {consumption && dailyConsumption && !isEditing && (
        <ReportActions
          type="electricity"
          month={currentMonthName}
          year={currentYear}
          consumption={consumption}
          dailyAverage={dailyConsumption}
          cost={estimatedCost || undefined}
          previousConsumption={previousReading ? parseFloat(previousReading) : undefined}
        />
      )}
    </div>
  );
};

export default ElectricityResults;
