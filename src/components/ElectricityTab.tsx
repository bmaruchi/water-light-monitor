
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Zap } from "lucide-react";
import { Button } from '@/components/ui/button';
import ConsumptionChart from './ConsumptionChart';
import { 
  calculateElectricityConsumption,
  calculateDailyConsumption,
  calculateEstimatedCost,
  formatCurrency,
  formatNumber
} from '@/lib/calculations';

const flagValues = {
  green: { name: 'Verde', value: 0 },
  yellow: { name: 'Amarela', value: 0.01874 },
  red1: { name: 'Vermelha - Patamar 1', value: 0.03971 },
  red2: { name: 'Vermelha - Patamar 2', value: 0.09492 }
};

const ElectricityTab: React.FC = () => {
  const [previousDate, setPreviousDate] = useState<Date>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [reading, setReading] = useState<string>('');
  const [previousReading, setPreviousReading] = useState<string>('');
  const [kwhPrice, setKwhPrice] = useState<string>('0.70');
  const [flagType, setFlagType] = useState<keyof typeof flagValues>('green');
  const [publicLighting, setPublicLighting] = useState<string>('35.80');

  const daysSinceLastReading = Math.ceil(
    (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const consumption = reading && previousReading 
    ? calculateElectricityConsumption(parseFloat(reading), parseFloat(previousReading))
    : null;
    
  const dailyConsumption = consumption && daysSinceLastReading 
    ? calculateDailyConsumption(consumption, daysSinceLastReading)
    : null;
    
  const estimatedCost = dailyConsumption && kwhPrice 
    ? calculateEstimatedCost(
        dailyConsumption,
        parseFloat(kwhPrice),
        flagValues[flagType].value,
        parseFloat(publicLighting || '0')
      )
    : null;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Form Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-amber-700 dark:text-amber-400 flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Registrar Leitura de Energia
            </CardTitle>
            <CardDescription>
              Insira os dados da sua fatura de energia para acompanhar o consumo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Previous Reading Date and Value - Moved to the top as requested */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="previous-date">Data da Leitura Anterior</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {previousDate ? format(previousDate, "dd/MM/yyyy") : "Selecione uma data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={previousDate}
                      onSelect={(date) => date && setPreviousDate(date)}
                      className="rounded-md border"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="previous-reading">Leitura Anterior (kWh)</Label>
                <Input
                  id="previous-reading"
                  type="number"
                  placeholder="1250"
                  value={previousReading}
                  onChange={(e) => setPreviousReading(e.target.value)}
                />
              </div>
            </div>

            {/* Current Reading Date and Value */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="current-date">Data da Leitura Atual</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {currentDate ? format(currentDate, "dd/MM/yyyy") : "Selecione uma data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={currentDate}
                      onSelect={(date) => date && setCurrentDate(date)}
                      className="rounded-md border"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="current-reading">Leitura Atual (kWh)</Label>
                <Input
                  id="current-reading"
                  type="number"
                  placeholder="1350"
                  value={reading}
                  onChange={(e) => setReading(e.target.value)}
                />
              </div>
            </div>

            {/* Price and Public Lighting */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kwh-price">Valor do kWh (R$)</Label>
                <Input
                  id="kwh-price"
                  type="number"
                  step="0.01"
                  placeholder="0.70"
                  value={kwhPrice}
                  onChange={(e) => setKwhPrice(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="public-lighting">Iluminação Pública (R$)</Label>
                <Input
                  id="public-lighting"
                  type="number"
                  step="0.01"
                  placeholder="35.80"
                  value={publicLighting}
                  onChange={(e) => setPublicLighting(e.target.value)}
                />
              </div>
            </div>

            {/* Flag Selection */}
            <div className="space-y-2">
              <Label htmlFor="flag-type">Bandeira Tarifária</Label>
              <select 
                id="flag-type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={flagType}
                onChange={(e) => setFlagType(e.target.value as keyof typeof flagValues)}
              >
                {Object.entries(flagValues).map(([key, { name }]) => (
                  <option key={key} value={key}>{name}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Results Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-amber-700 dark:text-amber-400">
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
                {/* Reduced font size for flag value */}
                <p className="text-lg font-bold">
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
                <li>Utilize ar-condicionado em temperatura moderada</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <ConsumptionChart type="electricity" />
    </div>
  );
};

export default ElectricityTab;
