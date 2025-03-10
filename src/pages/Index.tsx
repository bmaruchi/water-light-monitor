
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import TabsContainer from "@/components/TabsContainer";
import { Droplet, Zap } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="container py-8 px-4 md:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">
                Monitor de Consumo
              </h1>
              <p className="text-muted-foreground mt-2">
                Acompanhe e gerencie o consumo de energia elétrica e água
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Droplet className="h-4 w-4 text-blue-500" />
                <span>Registrar Água</span>
              </Button>
              <Button className="bg-amber-500 hover:bg-amber-600 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span>Registrar Energia</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main>
          <Card className="p-6">
            <TabsContainer />
          </Card>
        </main>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>© 2023 Monitor de Consumo - Economize recursos e ajude o planeta</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
