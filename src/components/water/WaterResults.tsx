
import React from 'react';
import { formatNumber } from '@/lib/calculations';
import ReportActions from '@/components/ReportActions';

interface WaterResultsProps {
  consumption: number | null;
  daysSinceLastReading: number;
  dailyConsumption: number | null;
  estimatedMonthlyConsumption: number | null;
  isEditing: boolean;
  currentMonthName: string;
  currentYear: number;
  previousReading: string;
}

const WaterResults: React.FC<WaterResultsProps> = ({
  consumption,
  daysSinceLastReading,
  dailyConsumption,
  estimatedMonthlyConsumption,
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
            {consumption ? `${formatNumber(consumption)} m³` : "falta dados"}
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
            {dailyConsumption ? `${formatNumber(dailyConsumption, 3)} m³` : "falta dados"}
          </p>
        </div>
      </div>

      <div className="pt-4">
        <p className="text-sm text-muted-foreground mb-1">Previsão para 30 dias</p>
        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
          {estimatedMonthlyConsumption 
            ? `${formatNumber(estimatedMonthlyConsumption)} m³` 
            : "falta dados"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Baseado no consumo diário atual
        </p>
      </div>

      <div className="pt-6 pb-2">
        <p className="text-sm font-medium">Dicas de Economia:</p>
        <ul className="text-sm text-muted-foreground list-disc pl-5 pt-2 space-y-1">
          <li>Tome banhos de até 5 minutos</li>
          <li>Conserte vazamentos imediatamente</li>
          <li>Use a máquina de lavar com carga completa</li>
          <li>Feche a torneira ao escovar os dentes</li>
        </ul>
      </div>

      {/* Report Actions */}
      {consumption && dailyConsumption && !isEditing && (
        <ReportActions
          type="water"
          month={currentMonthName}
          year={currentYear}
          consumption={consumption}
          dailyAverage={dailyConsumption}
          previousConsumption={previousReading ? parseFloat(previousReading) : undefined}
        />
      )}
    </div>
  );
};

export default WaterResults;
