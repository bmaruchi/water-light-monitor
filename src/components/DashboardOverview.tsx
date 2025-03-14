
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Droplet, Zap, TrendingDown, Gauge } from 'lucide-react';
import { formatNumber, getLastMonths } from '@/lib/calculations';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { getElectricityReadings } from '@/services/electricityService';
import { getWaterReadings } from '@/services/waterService';
import { format, subMonths } from 'date-fns';
import { pt } from 'date-fns/locale';

interface ReadingData {
  name: string;
  value: number;
  timestamp: string;
}

const DashboardOverview: React.FC = () => {
  const [electricityData, setElectricityData] = useState<ReadingData[]>([]);
  const [waterData, setWaterData] = useState<ReadingData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch electricity readings
        const electricityReadings = await getElectricityReadings();
        const processedElectricityData = processReadings(electricityReadings, 'electricity');
        setElectricityData(processedElectricityData);
        
        // Fetch water readings
        const waterReadings = await getWaterReadings();
        const processedWaterData = processReadings(waterReadings, 'water');
        setWaterData(processedWaterData);
      } catch (error) {
        console.error('Error fetching consumption data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Process readings to prepare data for charts
  const processReadings = (readings: any[], type: 'electricity' | 'water') => {
    if (!readings || readings.length === 0) {
      // Return placeholder data if no readings available
      return getLastMonths(6).map((month) => ({
        name: month,
        value: 0,
        timestamp: new Date().toISOString()
      }));
    }
    
    // Sort readings by date (newest first)
    const sortedReadings = [...readings].sort(
      (a, b) => new Date(b.current_date_reading).getTime() - new Date(a.current_date_reading).getTime()
    );
    
    // Take up to 6 most recent readings
    const recentReadings = sortedReadings.slice(0, 6).reverse();
    
    // Map readings to chart format
    return recentReadings.map(reading => {
      const date = new Date(reading.current_date_reading);
      return {
        name: format(date, 'MMM', { locale: pt }).charAt(0).toUpperCase() + format(date, 'MMM', { locale: pt }).slice(1),
        value: reading.consumption,
        timestamp: reading.current_date_reading
      };
    });
  };
  
  // Get current and previous values for comparison
  const currentElectricity = electricityData.length > 0 ? electricityData[electricityData.length - 1]?.value : 0;
  const previousElectricity = electricityData.length > 1 ? electricityData[electricityData.length - 2]?.value : 0;
  const electricityChange = previousElectricity ? ((currentElectricity - previousElectricity) / previousElectricity) * 100 : 0;
  
  const currentWater = waterData.length > 0 ? waterData[waterData.length - 1]?.value : 0;
  const previousWater = waterData.length > 1 ? waterData[waterData.length - 2]?.value : 0;
  const waterChange = previousWater ? ((currentWater - previousWater) / previousWater) * 100 : 0;
  
  // Calculate forecasted consumption for current month
  const getForecastedConsumption = (data: ReadingData[], type: 'electricity' | 'water') => {
    if (data.length === 0) return 0;
    
    const lastReading = data[data.length - 1];
    if (!lastReading) return 0;
    
    // Use average daily consumption from the last reading to project for the entire month
    const readingObj = type === 'electricity' 
      ? JSON.parse(localStorage.getItem('electricity_reading_values') || '{}')
      : JSON.parse(localStorage.getItem('water_reading_values') || '{}');
    
    if (!readingObj.daily_consumption) {
      // If no data in localStorage, use the last recorded consumption as forecast
      return lastReading.value;
    }
    
    // Calculate days remaining in current month
    const today = new Date();
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const daysRemaining = lastDayOfMonth.getDate() - today.getDate() + 1;
    
    // Calculate consumption to date plus projected remaining consumption
    const dailyConsumption = parseFloat(readingObj.daily_consumption);
    const daysElapsed = today.getDate() - 1;
    const consumptionToDate = dailyConsumption * daysElapsed;
    const projectedRemaining = dailyConsumption * daysRemaining;
    
    return consumptionToDate + projectedRemaining;
  };
  
  const forecastedElectricity = getForecastedConsumption(electricityData, 'electricity');
  const forecastedWater = getForecastedConsumption(waterData, 'water');
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Consumo de Energia
            </CardTitle>
            <CardDescription>
              Acompanhamento do consumo de energia elétrica
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Consumo Atual</p>
                <p className="text-2xl font-bold">{currentElectricity ? `${formatNumber(currentElectricity)} kWh` : "Sem dados"}</p>
              </div>
              {currentElectricity > 0 && previousElectricity > 0 && (
                <div className={`flex items-center ${electricityChange >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                  <span className="text-lg font-medium">{electricityChange >= 0 ? '+' : ''}{formatNumber(electricityChange)}%</span>
                  {electricityChange >= 0 ? 
                    <TrendingDown className="h-5 w-5 ml-1 rotate-180" /> : 
                    <TrendingDown className="h-5 w-5 ml-1" />
                  }
                </div>
              )}
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={electricityData}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} kWh`, 'Consumo']} />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#F59E0B"
                    strokeWidth={2} 
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
                <p className="text-sm text-muted-foreground">Previsão para o mês atual</p>
                <p className="text-xl font-bold text-amber-600">{forecastedElectricity ? `${formatNumber(forecastedElectricity)} kWh` : "Sem dados suficientes"}</p>
              </div>
              <Button variant="outline" className="w-full text-amber-600 border-amber-200 hover:bg-amber-50 dark:border-amber-800 dark:hover:bg-amber-950" asChild>
                <Link to="/electricity">Ver Detalhes</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <Droplet className="h-5 w-5 text-blue-500" />
              Consumo de Água
            </CardTitle>
            <CardDescription>
              Acompanhamento do consumo de água
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Consumo Atual</p>
                <p className="text-2xl font-bold">{currentWater ? `${formatNumber(currentWater)} m³` : "Sem dados"}</p>
              </div>
              {currentWater > 0 && previousWater > 0 && (
                <div className={`flex items-center ${waterChange >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                  <span className="text-lg font-medium">{waterChange >= 0 ? '+' : ''}{formatNumber(waterChange)}%</span>
                  {waterChange >= 0 ? 
                    <TrendingDown className="h-5 w-5 ml-1 rotate-180" /> : 
                    <TrendingDown className="h-5 w-5 ml-1" />
                  }
                </div>
              )}
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={waterData}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} m³`, 'Consumo']} />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3B82F6"
                    strokeWidth={2} 
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-sm text-muted-foreground">Previsão para o mês atual</p>
                <p className="text-xl font-bold text-blue-600">{forecastedWater ? `${formatNumber(forecastedWater)} m³` : "Sem dados suficientes"}</p>
              </div>
              <Button variant="outline" className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950" asChild>
                <Link to="/water">Ver Detalhes</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <Gauge className="h-5 w-5 text-green-500" />
              Eficiência Energética
            </CardTitle>
            <CardDescription>
              Dicas para economizar e uso mais eficiente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-100 dark:border-green-900">
                <h3 className="font-medium text-green-700 dark:text-green-400 mb-2">Dicas para economia de energia</h3>
                <ul className="text-sm space-y-2 list-disc pl-5">
                  <li>Substitua lâmpadas incandescentes por LED (economia de até 80%)</li>
                  <li>Desligue aparelhos da tomada quando não estiverem em uso</li>
                  <li>Utilize o ar-condicionado a 23°C (temperatura ideal)</li>
                  <li>Mantenha filtros de ar-condicionado limpos</li>
                </ul>
              </div>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-100 dark:border-blue-900">
                <h3 className="font-medium text-blue-700 dark:text-blue-400 mb-2">Dicas para economia de água</h3>
                <ul className="text-sm space-y-2 list-disc pl-5">
                  <li>Reduza o tempo do banho para 5 minutos</li>
                  <li>Reutilize a água da máquina de lavar para limpeza</li>
                  <li>Verifique regularmente se há vazamentos</li>
                  <li>Use regador para plantas em vez de mangueira</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;
