
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from '@tanstack/react-query';
import { 
  calculateElectricityConsumption,
  calculateDailyConsumption,
  calculateEstimatedCost
} from '@/lib/calculations';
import { saveElectricityReading, getLastElectricityReading } from '@/services/electricityService';
import ElectricityInputForm from './electricity/ElectricityInputForm';
import ElectricityResults from './electricity/ElectricityResults';
import ConsumptionChart from './ConsumptionChart';

type FlagType = "green" | "yellow" | "red1" | "red2";

const flagValues: Record<FlagType, { name: string; value: number }> = {
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
  const [flagType, setFlagType] = useState<FlagType>('green');
  const [publicLighting, setPublicLighting] = useState<string>('35.80');
  
  // State for editing mode
  const [isEditing, setIsEditing] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Load values from localStorage on initialization
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
        if (savedValues.flag_type && Object.keys(flagValues).includes(savedValues.flag_type)) {
          setFlagType(savedValues.flag_type as FlagType);
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
  const { data: lastReading } = useQuery({
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
      if (lastReading.flag_type && Object.keys(flagValues).includes(lastReading.flag_type)) {
        setFlagType(lastReading.flag_type as FlagType);
      }
      if (lastReading.public_lighting !== undefined) {
        setPublicLighting(lastReading.public_lighting.toString());
      }
    }
  }, [lastReading]);

  // Save values to localStorage whenever they change
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
      
      toast({
        title: "Leitura salva",
        description: "Os dados foram salvos com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao salvar leitura:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível salvar os dados."
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
          <CardContent>
            <ElectricityInputForm 
              previousDate={previousDate}
              setPreviousDate={setPreviousDate}
              currentDate={currentDate}
              setCurrentDate={setCurrentDate}
              previousReading={previousReading}
              setPreviousReading={setPreviousReading}
              reading={reading}
              setReading={setReading}
              kwhPrice={kwhPrice}
              setKwhPrice={setKwhPrice}
              flagType={flagType}
              setFlagType={setFlagType}
              publicLighting={publicLighting}
              setPublicLighting={setPublicLighting}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              isSaving={isSaving}
              handleConfirmValues={handleConfirmValues}
              handleEditValues={handleEditValues}
              handleSaveReading={handleSaveReading}
              flagValues={flagValues}
            />
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
          <CardContent>
            <ElectricityResults 
              consumption={consumption}
              daysSinceLastReading={daysSinceLastReading}
              dailyConsumption={dailyConsumption}
              estimatedCost={estimatedCost}
              flagType={flagType}
              flagValues={flagValues}
              isEditing={isEditing}
              currentMonthName={currentMonthName}
              currentYear={currentYear}
              previousReading={previousReading}
            />
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <ConsumptionChart type="electricity" />
    </div>
  );
};

export default ElectricityTab;
