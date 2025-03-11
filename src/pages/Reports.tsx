
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DownloadCloud, FileText, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getUserReports, deleteReport } from '@/lib/reportService';

interface StoredReport {
  id: string;
  userId: string;
  type: 'electricity' | 'water';
  month: string;
  year: number;
  createdAt: string;
  consumption: number;
  dailyAverage: number;
  cost?: number;
  fileName: string;
  pdfData?: string;
}

const Reports: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<StoredReport[]>([]);
  const [activeTab, setActiveTab] = useState<'electricity' | 'water'>('electricity');

  useEffect(() => {
    if (user) {
      const userReports = getUserReports(user.uid);
      setReports(userReports);
    }
  }, [user]);

  const handleDeleteReport = (reportId: string) => {
    if (deleteReport(reportId)) {
      setReports(prevReports => prevReports.filter(report => report.id !== reportId));
    }
  };

  const handleDownloadReport = (report: StoredReport) => {
    if (report.pdfData) {
      const linkSource = `data:application/pdf;base64,${report.pdfData}`;
      const downloadLink = document.createElement("a");
      const fileName = report.fileName;
      
      downloadLink.href = linkSource;
      downloadLink.download = fileName;
      downloadLink.click();
    }
  };

  const filteredReports = reports.filter(report => report.type === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="container py-8 px-4 md:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">
                Relatórios
              </h1>
              <p className="text-muted-foreground mt-2">
                Gerencie e visualize seus relatórios de consumo salvos
              </p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main>
          <Card className="p-6">
            <Tabs defaultValue="electricity" onValueChange={(value) => setActiveTab(value as 'electricity' | 'water')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="electricity" className="text-lg">Energia</TabsTrigger>
                <TabsTrigger value="water" className="text-lg">Água</TabsTrigger>
              </TabsList>

              <TabsContent value="electricity" className="space-y-4">
                {filteredReports.length > 0 ? (
                  filteredReports.map(report => (
                    <Card key={report.id} className="overflow-hidden">
                      <CardHeader className="bg-amber-50 dark:bg-amber-950/20 py-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            <CardTitle>
                              Relatório de Energia - {report.month}/{report.year}
                            </CardTitle>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => handleDownloadReport(report)}
                              title="Baixar relatório"
                            >
                              <DownloadCloud className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="text-red-500"
                              onClick={() => handleDeleteReport(report.id)}
                              title="Excluir relatório"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <CardDescription>
                          Criado em {new Date(report.createdAt).toLocaleDateString('pt-BR')}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="py-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Consumo</p>
                            <p className="font-medium">{report.consumption} kWh</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Média Diária</p>
                            <p className="font-medium">{report.dailyAverage.toFixed(3)} kWh</p>
                          </div>
                          {report.cost !== undefined && (
                            <div>
                              <p className="text-sm text-muted-foreground">Custo Estimado</p>
                              <p className="font-medium">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(report.cost)}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-30 mb-4" />
                    <h3 className="text-lg font-medium">Nenhum relatório encontrado</h3>
                    <p className="text-muted-foreground mt-1">
                      Registre leituras de energia e gere relatórios para visualizá-los aqui
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="water" className="space-y-4">
                {filteredReports.filter(report => report.type === 'water').length > 0 ? (
                  filteredReports.map(report => (
                    <Card key={report.id} className="overflow-hidden">
                      <CardHeader className="bg-blue-50 dark:bg-blue-950/20 py-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            <CardTitle>
                              Relatório de Água - {report.month}/{report.year}
                            </CardTitle>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => handleDownloadReport(report)}
                              title="Baixar relatório"
                            >
                              <DownloadCloud className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="text-red-500"
                              onClick={() => handleDeleteReport(report.id)}
                              title="Excluir relatório"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <CardDescription>
                          Criado em {new Date(report.createdAt).toLocaleDateString('pt-BR')}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Consumo</p>
                            <p className="font-medium">{report.consumption} m³</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Média Diária</p>
                            <p className="font-medium">{report.dailyAverage.toFixed(3)} m³</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-30 mb-4" />
                    <h3 className="text-lg font-medium">Nenhum relatório encontrado</h3>
                    <p className="text-muted-foreground mt-1">
                      Registre leituras de água e gere relatórios para visualizá-los aqui
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
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

export default Reports;
