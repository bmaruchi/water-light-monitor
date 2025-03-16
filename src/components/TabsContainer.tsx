
import React, { useState, memo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Droplet, Zap } from 'lucide-react';
import ElectricityTab from './ElectricityTab';
import WaterTab from './WaterTab';

// Memo para evitar re-renderizações desnecessárias
const MemoizedElectricityTab = memo(ElectricityTab);
const MemoizedWaterTab = memo(WaterTab);

const TabsContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("electricity");

  return (
    <Tabs defaultValue="electricity" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-2 mb-8">
        <TabsTrigger value="electricity" className="text-base flex items-center gap-2">
          <Zap className="h-4 w-4" />
          <span>Energia</span>
        </TabsTrigger>
        <TabsTrigger value="water" className="text-base flex items-center gap-2">
          <Droplet className="h-4 w-4" />
          <span>Água</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent 
        value="electricity" 
        className="animate-fade-in electricity-tab p-6 rounded-lg"
      >
        <MemoizedElectricityTab />
      </TabsContent>
      
      <TabsContent 
        value="water" 
        className="animate-fade-in water-tab p-6 rounded-lg"
      >
        <MemoizedWaterTab />
      </TabsContent>
    </Tabs>
  );
};

export default TabsContainer;
