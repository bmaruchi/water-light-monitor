
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Droplet, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from '@tanstack/react-query';
import ConsumptionChart from './ConsumptionChart';
import ReportActions from './ReportActions';
import { 
  calculateWaterConsumption,
  calculateDailyConsumption,
  calculateEstimatedWaterConsumption,
  formatNumber
} from '@/lib/calculations';
import { saveWaterReading, getLastWaterReading } from '@/services/waterService';

const WaterTab: React.FC = () => {
  const { toast } = useToast();
  
  const [previousDate, setPreviousDate] = useState<Date>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [reading, setReading] = useState<string>('');
  const [previousReading, setPreviousReading] = useState<string>('');
  
  // State for editing mode
  const [isEditing, setIsEditing] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Carregar valores do localStorage ao inicializar o componente
  useEffect(() => {
    const savedValuesStr = localStorage.getItem('water_reading_values');
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
      } catch (error) {
        console.error("Erro ao carregar dados salvos:", error);
      }
    }
  }, []);

  // Fetch the last reading from Supabase
  const { data: lastReading, isLoading } = useQuery({
    queryKey: ['lastWaterReading'],
    queryFn: getLastWaterReading
  });

  // Set the form values based on the last reading
  useEffect(() => {
    if (lastReading && !localStorage.getItem('water_reading_values')) {
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
    }
  }, [lastReading]);

  // Função para salvar os valores no localStorage sempre que forem alterados
  useEffect(() => {
    localStorage.setItem('water_reading_values', JSON.stringify({
      previous_date_reading: previousDate.toISOString(),
      current_date_reading: currentDate.toISOString(),
      previous_reading: previousReading,
      current_reading: reading
    }));
  }, [previousDate, currentDate, previousReading, reading]);

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

    const consumptionValue = calculateWaterConsumption(parseFloat(reading), parseFloat(previousReading));
    const daysSinceLastReading = Math.ceil(
      (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const dailyConsumptionValue = calculateDailyConsumption(consumptionValue, daysSinceLastReading);
    const estimatedMonthlyConsumptionValue = calculateEstimatedWaterConsumption(dailyConsumptionValue);

    setIsSaving(true);
    try {
      await saveWaterReading({
        previous_date_reading: previousDate,
        current_date_reading: currentDate,
        previous_reading: parseFloat(previousReading),
        current_reading: parseFloat(reading),
        consumption: consumptionValue,
        daily_consumption: dailyConsumptionValue,
        estimated_monthly_consumption: estimatedMonthlyConsumptionValue
      });
    } finally {
      setIsSaving(false);
    }
  };

  const daysSinceLastReading = Math.ceil(
    (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const consumption = reading && previousReading 
    ? calculateWaterConsumption(parseFloat(reading), parseFloat(previousReading))
    : null;
    
  const dailyConsumption = consumption && daysSinceLastReading 
    ? calculateDailyConsumption(consumption, daysSinceLastReading)
    : null;
    
  const estimatedMonthlyConsumption = dailyConsumption 
    ? calculateEstimatedWaterConsumption(dailyConsumption)
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
            <CardTitle className="text-xl text-blue-700 dark:text-blue-400 flex items-center gap-2">
              <Droplet className="h-5 w-5" />
              Registrar Leitura de Água
            </CardTitle>
            <CardDescription>
              Insira os dados da sua fatura de água para acompanhar o consumo
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
                      className="w-full justify-start text-left font-normal input-water"
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
                <Label htmlFor="previous-reading">Leitura Anterior (m³)</Label>
                <Input
                  id="previous-reading"
                  type="number"
                  placeholder="120"
                  value={previousReading}
                  onChange={(e) => setPreviousReading(e.target.value)}
                  className="input-water"
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
                      className="w-full justify-start text-left font-normal input-water"
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
                <Label htmlFor="current-reading">Leitura Atual (m³)</Label>
                <Input
                  id="current-reading"
                  type="number"
                  placeholder="130"
                  value={reading}
                  onChange={(e) => setReading(e.target.value)}
                  className="input-water"
                  disabled={!isEditing}
                />
              </div>
            </div>
            
            {/* Confirm/Edit Button */}
            <div className="pt-4">
              {isEditing ? (
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700" 
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
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <ConsumptionChart type="water" />
    </div>
  );
};

export default WaterTab;
