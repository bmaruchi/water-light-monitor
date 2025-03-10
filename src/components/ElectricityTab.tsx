
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Calculator } from "lucide-react";
import { cn } from '@/lib/utils';
import ConsumptionChart from './ConsumptionChart';
import { 
  calculateElectricityConsumption,
  calculateDailyConsumption,
  calculateEstimatedCost,
  formatCurrency,
  formatNumber
} from '@/lib/calculations';
import { toast } from 'sonner';

const ElectricityTab: React.FC = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [reading, setReading] = useState<string>('');
  const [previousReading, setPreviousReading] = useState<string>('1250');
  const [kwhPrice, setKwhPrice] = useState<string>('0.70');
  const [flagType, setFlagType] = useState<string>('green');
  const [flagValue, setFlagValue] = useState<string>('0');
  const [publicLighting, setPublicLighting] = useState<string>('35.80');
  const [daysSinceLastReading, setDaysSinceLastReading] = useState<string>('30');

  const calculateValues = () => {
    if (!reading || parseFloat(reading) < parseFloat(previousReading)) {
      toast.error("Por favor, insira uma leitura válida maior que a anterior.");
      return;
    }

    const currentReading = parseFloat(reading);
    const prevReading = parseFloat(previousReading);
    const days = parseFloat(daysSinceLastReading);
    const kwhPriceValue = parseFloat(kwhPrice);
    const flagValueNum = parseFloat(flagValue);
    const publicLightingValue = parseFloat(publicLighting);
    
    const consumption = calculateElectricityConsumption(currentReading, prevReading);
    const dailyConsumption = calculateDailyConsumption(consumption, days);
    const estimatedCost = calculateEstimatedCost(
      dailyConsumption, 
      kwhPriceValue, 
      flagValueNum, 
      publicLightingValue
    );

    toast.success("Cálculos realizados com sucesso!");
  };

  const consumption = reading && previousReading 
    ? calculateElectricityConsumption(parseFloat(reading), parseFloat(previousReading))
    : 0;
    
  const dailyConsumption = consumption && daysSinceLastReading 
    ? calculateDailyConsumption(consumption, parseFloat(daysSinceLastReading))
    : 0;
    
  const estimatedCost = dailyConsumption && kwhPrice && flagValue && publicLighting
    ? calculateEstimatedCost(
        dailyConsumption, 
        parseFloat(kwhPrice), 
        parseFloat(flagValue), 
        parseFloat(publicLighting)
      )
    : 0;

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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reading-date">Data da Leitura</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal input-electricity"
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
                  className="input-electricity"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="current-reading">Leitura Atual (kWh)</Label>
                <Input
                  id="current-reading"
                  type="number"
                  placeholder="1350"
                  value={reading}
                  onChange={(e) => setReading(e.target.value)}
                  className="input-electricity"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="previous-reading">Leitura Anterior (kWh)</Label>
                <Input
                  id="previous-reading"
                  type="number"
                  placeholder="1250"
                  value={previousReading}
                  onChange={(e) => setPreviousReading(e.target.value)}
                  className="input-electricity"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kwh-price">Valor do kWh (R$)</Label>
                <Input
                  id="kwh-price"
                  type="number"
                  step="0.01"
                  placeholder="0.70"
                  value={kwhPrice}
                  onChange={(e) => setKwhPrice(e.target.value)}
                  className="input-electricity"
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
                  className="input-electricity"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="flag-type">Bandeira Tarifária</Label>
                <Select value={flagType} onValueChange={setFlagType}>
                  <SelectTrigger id="flag-type" className="input-electricity">
                    <SelectValue placeholder="Selecione a bandeira" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="green">Verde</SelectItem>
                    <SelectItem value="yellow">Amarela</SelectItem>
                    <SelectItem value="red1">Vermelha - Patamar 1</SelectItem>
                    <SelectItem value="red2">Vermelha - Patamar 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="flag-value">Valor Adicional (R$/kWh)</Label>
                <Input
                  id="flag-value"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={flagValue}
                  onChange={(e) => setFlagValue(e.target.value)}
                  className="input-electricity"
                />
              </div>
            </div>

            <Button 
              onClick={calculateValues}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white"
            >
              <Calculator className="mr-2 h-4 w-4" /> Calcular
            </Button>
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
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Consumo Atual</p>
                <p className="text-2xl font-bold">{formatNumber(consumption)} kWh</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Consumo Diário</p>
                <p className="text-2xl font-bold">{formatNumber(dailyConsumption)} kWh</p>
              </div>
            </div>

            <div className="pt-4">
              <p className="text-sm text-muted-foreground mb-1">Previsão de Valor até Próxima Leitura</p>
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {formatCurrency(estimatedCost)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Baseado no consumo diário atual por mais 30 dias
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Valor Base</p>
                <p className="text-lg font-medium">
                  {formatCurrency(dailyConsumption * 30 * parseFloat(kwhPrice || '0'))}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Bandeira + Iluminação</p>
                <p className="text-lg font-medium">
                  {formatCurrency(
                    (dailyConsumption * 30 * parseFloat(flagValue || '0')) + 
                    parseFloat(publicLighting || '0')
                  )}
                </p>
              </div>
            </div>

            <div className="pt-4 pb-2">
              <p className="text-sm font-medium">Dicas de Economia:</p>
              <ul className="text-sm text-muted-foreground list-disc pl-5 pt-2 space-y-1">
                <li>Substitua lâmpadas por modelos LED</li>
                <li>Desligue aparelhos em modo standby</li>
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

// Import Zap component at the top of the file
import { Zap } from "lucide-react";
