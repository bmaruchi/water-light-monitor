import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Droplet, LightbulbIcon, Zap, TrendingDown, ChartLineIcon, Gauge } from 'lucide-react';
import { formatCurrency, formatNumber, getLastMonths, getRandomData } from '@/lib/calculations';
import { Button } from '@/components/ui/button';

const DashboardOverview: React.FC = () => {
  // Mock data
  const months = getLastMonths(6);
  const electricityData = months.map((month, index) => ({
    name: month,
    value: getRandomData(1, 150, 350)[0]
  }));
  
  const waterData = months.map((month, index) => ({
    name: month,
    value: getRandomData(1, 8, 20)[0]
  }));

  const pieData = [
    { name: 'Iluminação', value: 35 },
    { name: 'Refrigerador', value: 25 },
    { name: 'Ar Condicionado', value: 20 },
    { name: 'Outros', value: 20 },
  ];
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Get current month values
  const currentElectricity = electricityData[electricityData.length - 1].value;
  const previousElectricity = electricityData[electricityData.length - 2].value;
  const electricityChange = ((currentElectricity - previousElectricity) / previousElectricity) * 100;
  
  const currentWater = waterData[waterData.length - 1].value;
  const previousWater = waterData[waterData.length - 2].value;
  const waterChange = ((currentWater - previousWater) / previousWater) * 100;
  
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
                <p className="text-2xl font-bold">{currentElectricity} kWh</p>
              </div>
              <div className={`flex items-center ${electricityChange >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                <span className="text-lg font-medium">{electricityChange >= 0 ? '+' : ''}{formatNumber(electricityChange)}%</span>
                {electricityChange >= 0 ? 
                  <TrendingDown className="h-5 w-5 ml-1 rotate-180" /> : 
                  <TrendingDown className="h-5 w-5 ml-1" />
                }
              </div>
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
            <div className="mt-4">
              <Button variant="outline" className="w-full text-amber-600 border-amber-200 hover:bg-amber-50 dark:border-amber-800 dark:hover:bg-amber-950">
                Ver Detalhes
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
                <p className="text-2xl font-bold">{currentWater} m³</p>
              </div>
              <div className={`flex items-center ${waterChange >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                <span className="text-lg font-medium">{waterChange >= 0 ? '+' : ''}{formatNumber(waterChange)}%</span>
                {waterChange >= 0 ? 
                  <TrendingDown className="h-5 w-5 ml-1 rotate-180" /> : 
                  <TrendingDown className="h-5 w-5 ml-1" />
                }
              </div>
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
            <div className="mt-4">
              <Button variant="outline" className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950">
                Ver Detalhes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <LightbulbIcon className="h-5 w-5 text-yellow-500" />
              Distribuição do Consumo
            </CardTitle>
            <CardDescription>
              Como a energia é utilizada em sua residência
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Porcentagem']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Uso mais eficiente</p>
                <p className="text-base font-medium text-green-600 dark:text-green-400">Refrigerador novo</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Potencial economia</p>
                <p className="text-base font-medium text-green-600 dark:text-green-400">{formatCurrency(85.40)}/mês</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <Gauge className="h-5 w-5 text-eco" />
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
