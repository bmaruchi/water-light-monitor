
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Calculator, Zap, Save } from "lucide-react";
import { cn } from '@/lib/utils';
import ConsumptionChart from './ConsumptionChart';
import ReportActions from './ReportActions';
import { useToast } from "@/hooks/use-toast";
import { useQuery } from '@tanstack/react-query';
import { 
  calculateElectricityConsumption,
  calculateDailyConsumption,
  calculateEstimatedCost,
  formatCurrency,
  formatNumber
} from '@/lib/calculations';
import { saveElectricityReading, getLastElectricityReading } from '@/services/electricityService';

const flagValues = {
  green: { name: 'Verde', value: 0 },
  yellow: { name: 'Amarela', value: 0.01874 },
  red1: { name: 'Vermelha - Patamar 1', value: 0.03971 },
  red2: { name: 'Vermelha - Patamar 2', value: 0.09492 }
};

const ElectricityTab: React.FC = () => {
  const { toast } = useToast();
  
  // State for form values
  const [previousDate, setPreviousDate] = useState<Date>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [reading, setReading] = useState<string>('');
  const [previousReading, setPreviousReading] = useState<string>('');
  const [kwhPrice, setKwhPrice] = useState<string>('0.70');
  const [flagType, setFlagType] = useState<keyof typeof flagValues>('green');
  const [publicLighting, setPublicLighting] = useState<string>('35.80');
  
  // State for editing mode
  const [isEditing, setIsEditing] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Carregar valores do localStorage ao inicializar o componente
  useEffect(() => {
    const savedValuesStr = localStorage.getItem('electricity_reading_values');
    if (savedValuesStr) {
      try {
        const savedValues = JSON.parse(savedValuesStr);
        if (savedValues.previous_date_reading) {
          setPreviousDate(new Date(savedValues.previous_date_reading));
        }
        if (savedValues.current_date_reading) {
          setCurrentDate(new Date(savedValues.current_date_reading));
        }
        if (savedValues.previous_reading !== undefined) {
          setPreviousReading(savedValues.previous_reading.toString());
        }
        if (savedValues.current_reading !== undefined && savedValues.current_reading !== '') {
          setReading(savedValues.current_reading.toString());
        }
        if (savedValues.kwh_price !== undefined) {
          setKwhPrice(savedValues.kwh_price.toString());
        }
        if (savedValues.flag_type) {
          setFlagType(savedValues.flag_type as keyof typeof flagValues);
        }
        if (savedValues.public_lighting !== undefined) {
          setPublicLighting(savedValues.public_lighting.toString());
        }
      } catch (error) {
        console.error("Erro ao carregar dados salvos:", error);
      }
    }
  }, []);

  // Fetch the last reading from Supabase
  const { data: lastReading, isLoading } = useQuery({
    queryKey: ['lastElectricityReading'],
    queryFn: getLastElectricityReading
  });

  // Set the form values based on the last reading
  useEffect(() => {
    if (lastReading && !localStorage.getItem('electricity_reading_values')) {
      if (lastReading.previous_date_reading) {
        setPreviousDate(new Date(lastReading.previous_date_reading));
      }
      if (lastReading.current_date_reading) {
        setCurrentDate(new Date(lastReading.current_date_reading));
      }
      if (lastReading.previous_reading !== undefined) {
        setPreviousReading(lastReading.previous_reading.toString());
      }
      if (lastReading.current_reading !== undefined) {
        setPreviousReading(lastReading.current_reading.toString());
      }
      if (lastReading.kwh_price !== undefined) {
        setKwhPrice(lastReading.kwh_price.toString());
      }
      if (lastReading.flag_type) {
        setFlagType(lastReading.flag_type as keyof typeof flagValues);
      }
      if (lastReading.public_lighting !== undefined) {
        setPublicLighting(lastReading.public_lighting.toString());
      }
    }
  }, [lastReading]);

  // Função para salvar os valores no localStorage sempre que forem alterados
  useEffect(() => {
    localStorage.setItem('electricity_reading_values', JSON.stringify({
      previous_date_reading: previousDate.toISOString(),
      current_date_reading: currentDate.toISOString(),
      previous_reading: previousReading,
      current_reading: reading,
      kwh_price: kwhPrice,
      flag_type: flagType,
      flag_value: flagValues[flagType].value,
      public_lighting: publicLighting
    }));
  }, [previousDate, currentDate, previousReading, reading, kwhPrice, flagType, publicLighting]);

  // Handle form submission when values are confirmed
  const handleConfirmValues = () => {
    setIsEditing(false);
  };

  // Reset to editing mode
  const handleEditValues = () => {
    setIsEditing(true);
  };

  const handleSaveReading = async () => {
    if (!reading || !previousReading || isNaN(parseFloat(reading)) || isNaN(parseFloat(previousReading))) {
      toast({
        variant: "destructive",
        title: "Dados incompletos",
        description: "Preencha todos os campos corretamente."
      });
      return;
    }

    const consumptionValue = calculateElectricityConsumption(parseFloat(reading), parseFloat(previousReading));
    const daysSinceLastReading = Math.ceil(
      (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const dailyConsumptionValue = calculateDailyConsumption(consumptionValue, daysSinceLastReading);
    const estimatedCostValue = calculateEstimatedCost(
      dailyConsumptionValue,
      parseFloat(kwhPrice),
      flagValues[flagType].value,
      parseFloat(publicLighting || '0')
    );

    setIsSaving(true);
    try {
      await saveElectricityReading({
        previous_date_reading: previousDate,
        current_date_reading: currentDate,
        previous_reading: parseFloat(previousReading),
        current_reading: parseFloat(reading),
        kwh_price: parseFloat(kwhPrice),
        flag_type: flagType,
        flag_value: flagValues[flagType].value,
        public_lighting: parseFloat(publicLighting || '0'),
        consumption: consumptionValue,
        daily_consumption: dailyConsumptionValue,
        estimated_cost: estimatedCostValue
      });
    } finally {
      setIsSaving(false);
    }
  };

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

  // Get the current month and year for the report
  const currentMonthName = format(currentDate, 'MMMM');
  const currentYear = currentDate.getFullYear();

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
            {/* Previous Reading Date and Value */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="previous-date">Data da Leitura Anterior</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      disabled={!isEditing}
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
                      disabled={!isEditing}
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
                  disabled={!isEditing}
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
                      disabled={!isEditing}
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
                      disabled={!isEditing}
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
                  disabled={!isEditing}
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
                  disabled={!isEditing}
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
                  disabled={!isEditing}
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
                disabled={!isEditing}
              >
                {Object.entries(flagValues).map(([key, { name }]) => (
                  <option key={key} value={key}>{name}</option>
                ))}
              </select>
            </div>
            
            {/* Confirm/Edit Button */}
            <div className="pt-4">
              {isEditing ? (
                <Button 
                  className="w-full bg-amber-600 hover:bg-amber-700" 
                  onClick={handleConfirmValues}
                  disabled={!reading || !previousReading}
                >
                  Confirmar Valores
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    className="flex-1" 
                    variant="outline" 
                    onClick={handleEditValues}
                  >
                    Editar Valores
                  </Button>
                  <Button 
                    className="flex-1 flex items-center gap-2" 
                    onClick={handleSaveReading}
                    disabled={isSaving}
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Salvando...' : 'Salvar no Supabase'}
                  </Button>
                </div>
              )}
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
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <ConsumptionChart type="electricity" />
    </div>
  );
};

export default ElectricityTab;
