
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { saveReport, generateReportFileName, ReportType } from "@/lib/reportService";
import { generatePdf } from '@/lib/reportService';

interface ReportActionsProps {
  type: ReportType;
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
  const handleDownload = () => {
    try {
      const reportData = {
        type,
        month,
        year,
        consumption,
        dailyAverage,
        cost,
        previousConsumption
      };
      
      const pdfDataUri = generatePdf(reportData);
      const fileName = generateReportFileName(type, month, year);
      
      // Create a link element
      const link = document.createElement('a');
      link.href = pdfDataUri;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Relatório baixado",
        description: "Seu relatório foi baixado com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao baixar relatório:", error);
      toast({
        variant: "destructive",
        title: "Erro ao baixar",
        description: "Não foi possível baixar o relatório."
      });
    }
  };

  const handleSave = async () => {
    const reportData = {
      type,
      month,
      year,
      consumption,
      dailyAverage,
      cost,
      previousConsumption
    };
    
    await saveReport(reportData);
  };

  return (
    <div className="flex flex-col gap-2 pt-2">
      <p className="text-sm font-medium mb-1">Ações:</p>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1 w-full" 
          onClick={handleDownload}
        >
          <Download className="h-4 w-4" />
          <span>Baixar PDF</span>
        </Button>
        <Button 
          size="sm" 
          className={`flex items-center gap-1 w-full ${type === 'electricity' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'}`} 
          onClick={handleSave}
        >
          <Save className="h-4 w-4" />
          <span>Salvar Relatório</span>
        </Button>
      </div>
    </div>
  );
};

export default ReportActions;
