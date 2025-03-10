
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Calculator, Droplet } from "lucide-react";
import { cn } from '@/lib/utils';
import ConsumptionChart from './ConsumptionChart';
import { 
  calculateWaterConsumption,
  calculateDailyConsumption,
  calculateEstimatedWaterConsumption,
  formatNumber
} from '@/lib/calculations';
import { toast } from 'sonner';

const WaterTab: React.FC = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [reading, setReading] = useState<string>('');
  const [previousReading, setPreviousReading] = useState<string>('120');
  const [daysSinceLastReading, setDaysSinceLastReading] = useState<string>('30');

  const calculateValues = () => {
    if (!reading || parseFloat(reading) < parseFloat(previousReading)) {
      toast.error("Por favor, insira uma leitura válida maior que a anterior.");
      return;
    }

    toast.success("Cálculos realizados com sucesso!");
  };

  const consumption = reading && previousReading 
    ? calculateWaterConsumption(parseFloat(reading), parseFloat(previousReading))
    : 0;
    
  const dailyConsumption = consumption && daysSinceLastReading 
    ? calculateDailyConsumption(consumption, parseFloat(daysSinceLastReading))
    : 0;
    
  const estimatedMonthlyConsumption = dailyConsumption 
    ? calculateEstimatedWaterConsumption(dailyConsumption)
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Form Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-blue-700 dark:text-blue-400 flex items-center gap-2">
              <Droplet className="h-5 w-5" />
              Registrar Leitura de Água
            </CardTitle>
            <CardDescription>
              Insira os dados da sua fatura de água para acompanhar o consumo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reading-date">Data da Leitura</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal input-water"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "dd/MM/yyyy") : "Selecione uma data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => date && setDate(date)}
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="days-since-last">Dias desde última leitura</Label>
                <Input
                  id="days-since-last"
                  type="number"
                  placeholder="30"
                  value={daysSinceLastReading}
                  onChange={(e) => setDaysSinceLastReading(e.target.value)}
                  className="input-water"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="current-reading">Leitura Atual (m³)</Label>
                <Input
                  id="current-reading"
                  type="number"
                  placeholder="130"
                  value={reading}
                  onChange={(e) => setReading(e.target.value)}
                  className="input-water"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="previous-reading">Leitura Anterior (m³)</Label>
                <Input
                  id="previous-reading"
                  type="number"
                  placeholder="120"
                  value={previousReading}
                  onChange={(e) => setPreviousReading(e.target.value)}
                  className="input-water"
                />
              </div>
            </div>

            <Button 
              onClick={calculateValues}
              className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Calculator className="mr-2 h-4 w-4" /> Calcular
            </Button>
          </CardContent>
        </Card>

        {/* Results Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-blue-700 dark:text-blue-400">
              Resultados
            </CardTitle>
            <CardDescription>
              Informações e cálculos baseados nos dados inseridos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Consumo Atual</p>
                <p className="text-2xl font-bold">{formatNumber(consumption)} m³</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Consumo Diário</p>
                <p className="text-2xl font-bold">{formatNumber(dailyConsumption, 3)} m³</p>
              </div>
            </div>

            <div className="pt-4">
              <p className="text-sm text-muted-foreground mb-1">Previsão para 30 dias</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {formatNumber(estimatedMonthlyConsumption)} m³
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Baseado no consumo diário atual por 30 dias
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
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <ConsumptionChart type="water" />
    </div>
  );
};

export default WaterTab;
