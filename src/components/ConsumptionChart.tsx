
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getLastMonths, getRandomData } from '@/lib/calculations';

interface ConsumptionChartProps {
  type: 'water' | 'electricity';
  months?: number;
}

const ConsumptionChart: React.FC<ConsumptionChartProps> = ({ 
  type = 'electricity',
  months = 6
}) => {
  const lastMonths = getLastMonths(months);
  
  const getConsumptionData = () => {
    const values = type === 'electricity' 
      ? getRandomData(months, 150, 350) 
      : getRandomData(months, 8, 20);
    
    return lastMonths.map((month, index) => ({
      name: month,
      consumption: values[index]
    }));
  };

  return (
    <div className="w-full h-72 mt-6">
      <h3 className="text-lg font-medium mb-2">
        Consumo dos Últimos {months} Meses
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={getConsumptionData()}
          margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            formatter={(value) => [
              `${value} ${type === 'electricity' ? 'kWh' : 'm³'}`,
              'Consumo'
            ]}
          />
          <Bar 
            dataKey="consumption" 
            fill={type === 'electricity' ? '#F59E0B' : '#3B82F6'} 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ConsumptionChart;
