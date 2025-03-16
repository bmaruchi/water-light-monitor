
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Droplet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from '@tanstack/react-query';
import { 
  calculateWaterConsumption,
  calculateDailyConsumption,
  calculateEstimatedWaterConsumption
} from '@/lib/calculations';
import { saveWaterReading, getLastWaterReading } from '@/services/waterService';
import WaterInputForm from './water/WaterInputForm';
import WaterResults from './water/WaterResults';
import ConsumptionChart from './ConsumptionChart';

const WaterTab: React.FC = () => {
  const { toast } = useToast();
  
  const [previousDate, setPreviousDate] = useState<Date>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [reading, setReading] = useState<string>('');
  const [previousReading, setPreviousReading] = useState<string>('');
  
  // State for editing mode
  const [isEditing, setIsEditing] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Load values from localStorage on initialization
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
  const { data: lastReading } = useQuery({
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

  // Save values to localStorage whenever they change
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
          <CardContent>
            <WaterInputForm 
              previousDate={previousDate}
              setPreviousDate={setPreviousDate}
              currentDate={currentDate}
              setCurrentDate={setCurrentDate}
              previousReading={previousReading}
              setPreviousReading={setPreviousReading}
              reading={reading}
              setReading={setReading}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              isSaving={isSaving}
              handleConfirmValues={handleConfirmValues}
              handleEditValues={handleEditValues}
              handleSaveReading={handleSaveReading}
            />
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
          <CardContent>
            <WaterResults 
              consumption={consumption}
              daysSinceLastReading={daysSinceLastReading}
              dailyConsumption={dailyConsumption}
              estimatedMonthlyConsumption={estimatedMonthlyConsumption}
              isEditing={isEditing}
              currentMonthName={currentMonthName}
              currentYear={currentYear}
              previousReading={previousReading}
            />
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <ConsumptionChart type="water" />
    </div>
  );
};

export default WaterTab;
