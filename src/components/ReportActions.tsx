
import React from 'react';
import { Button } from "@/components/ui/button";
import { DownloadCloud, Save } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/AuthContext';
import { generateMonthlyReport, downloadPDF } from '@/lib/pdfGenerator';
import { saveReport, generateReportFileName } from '@/lib/reportService';

interface ReportActionsProps {
  type: 'electricity' | 'water';
  month: string;
  year: number;
  consumption: number;
  dailyAverage: number;
  cost?: number;
  previousConsumption?: number;
}

const ReportActions: React.FC<ReportActionsProps> = ({ 
  type, 
  month, 
  year, 
  consumption, 
  dailyAverage,
  cost,
  previousConsumption
}) => {
  const { toast } = useToast();
  const { user } = useAuth();

  // Calculate percentage change if previous consumption is available
  const percentageChange = previousConsumption 
    ? ((consumption - previousConsumption) / previousConsumption) * 100 
    : undefined;

  const reportData = {
    type,
    month,
    year,
    consumption,
    dailyAverage,
    cost,
    previousConsumption,
    percentageChange
  };

  const handleDownload = () => {
    try {
      const doc = generateMonthlyReport(reportData);
      const fileName = generateReportFileName(type, month, year);
      downloadPDF(doc, fileName);
      toast({
        title: "Relatório baixado",
        description: "O relatório foi gerado e baixado com sucesso."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao gerar relatório",
        description: "Não foi possível gerar o relatório. Tente novamente."
      });
    }
  };

  const handleSave = () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Não autenticado",
        description: "Você precisa estar logado para salvar relatórios."
      });
      return;
    }

    try {
      const doc = generateMonthlyReport(reportData);
      const fileName = generateReportFileName(type, month, year);
      
      // Convert PDF to base64 string
      const pdfData = doc.output('datauristring').split(',')[1];
      
      saveReport({
        userId: user.id, // Updated from user.uid to user.id
        type,
        month,
        year,
        consumption,
        dailyAverage,
        cost,
        fileName,
        pdfData
      });
      
      toast({
        title: "Relatório salvo",
        description: "O relatório foi salvo com sucesso e pode ser acessado na página de relatórios."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar relatório",
        description: "Não foi possível salvar o relatório. Tente novamente."
      });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 mt-4">
      <Button 
        onClick={handleDownload}
        variant="outline"
        className="flex items-center gap-2"
      >
        <DownloadCloud className="h-4 w-4" />
        Baixar relatório
      </Button>
      <Button 
        onClick={handleSave}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Save className="h-4 w-4" />
        Salvar no sistema
      </Button>
    </div>
  );
};

export default ReportActions;
