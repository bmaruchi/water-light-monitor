
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Download, Droplet, Zap } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { getReports } from '@/lib/reportService';
import { formatNumber, formatCurrency } from '@/lib/calculations';

const Reports = () => {
  const { data: reports = [], isLoading, error } = useQuery({
    queryKey: ['reports'],
    queryFn: getReports
  });

  const waterReports = reports.filter(report => report.type === 'water');
  const electricityReports = reports.filter(report => report.type === 'electricity');

  const handleDownload = (pdfData: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = pdfData;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Seus Relatórios</h1>
      
      <Tabs defaultValue="water" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="water" className="flex items-center gap-2">
            <Droplet className="h-4 w-4" />
            Água
          </TabsTrigger>
          <TabsTrigger value="electricity" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Energia
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="water" className="space-y-4">
          {isLoading ? (
            <p>Carregando relatórios...</p>
          ) : error ? (
            <p className="text-red-500">Erro ao carregar relatórios de água</p>
          ) : waterReports.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Você ainda não tem relatórios de água.
                </p>
              </CardContent>
            </Card>
          ) : (
            waterReports.map(report => (
              <Card key={report.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center justify-between">
                    <span>{report.month} de {report.year}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex items-center gap-1"
                      onClick={() => handleDownload(report.pdf_data, report.file_name)}
                    >
                      <Download className="h-4 w-4" />
                      <span>Baixar</span>
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Relatório gerado em {format(parseISO(report.created_at), 'dd/MM/yyyy')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Consumo Total</p>
                      <p className="text-lg font-semibold">{formatNumber(report.consumption)} m³</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Consumo Diário</p>
                      <p className="text-lg font-semibold">{formatNumber(report.daily_average)} m³/dia</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="electricity" className="space-y-4">
          {isLoading ? (
            <p>Carregando relatórios...</p>
          ) : error ? (
            <p className="text-red-500">Erro ao carregar relatórios de energia</p>
          ) : electricityReports.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Você ainda não tem relatórios de energia.
                </p>
              </CardContent>
            </Card>
          ) : (
            electricityReports.map(report => (
              <Card key={report.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center justify-between">
                    <span>{report.month} de {report.year}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex items-center gap-1"
                      onClick={() => handleDownload(report.pdf_data, report.file_name)}
                    >
                      <Download className="h-4 w-4" />
                      <span>Baixar</span>
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Relatório gerado em {format(parseISO(report.created_at), 'dd/MM/yyyy')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Consumo Total</p>
                      <p className="text-lg font-semibold">{formatNumber(report.consumption)} kWh</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Consumo Diário</p>
                      <p className="text-lg font-semibold">{formatNumber(report.daily_average)} kWh/dia</p>
                    </div>
                  </div>
                  
                  {report.cost && (
                    <div>
                      <p className="text-sm text-muted-foreground">Custo Estimado</p>
                      <p className="text-lg font-semibold text-amber-600">{formatCurrency(report.cost)}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
