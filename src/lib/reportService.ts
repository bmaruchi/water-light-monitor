
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { formatCurrency, formatNumber } from "./calculations";

export type ReportType = 'electricity' | 'water';

interface ReportData {
  type: ReportType;
  month: string;
  year: number;
  consumption: number;
  dailyAverage: number;
  cost?: number;
  previousConsumption?: number;
}

export const generatePdf = (reportData: ReportData): string => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const title = `Relatório de ${reportData.type === 'electricity' ? 'Energia' : 'Água'}`;
  const subtitle = `${reportData.month} de ${reportData.year}`;
  
  // Title
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  doc.text(title, pageWidth / 2, 20, { align: 'center' });
  
  // Subtitle
  doc.setFontSize(16);
  doc.text(subtitle, pageWidth / 2, 30, { align: 'center' });
  
  // Content
  doc.setFontSize(12);
  let yPosition = 50;
  const lineHeight = 8;
  
  doc.text(`Consumo total: ${formatNumber(reportData.consumption)} ${reportData.type === 'electricity' ? 'kWh' : 'm³'}`, 20, yPosition);
  yPosition += lineHeight;
  
  doc.text(`Consumo diário médio: ${formatNumber(reportData.dailyAverage)} ${reportData.type === 'electricity' ? 'kWh/dia' : 'm³/dia'}`, 20, yPosition);
  yPosition += lineHeight;
  
  if (reportData.cost !== undefined && reportData.type === 'electricity') {
    doc.text(`Custo estimado: ${formatCurrency(reportData.cost)}`, 20, yPosition);
    yPosition += lineHeight;
  }
  
  if (reportData.previousConsumption !== undefined) {
    const diff = reportData.consumption - reportData.previousConsumption;
    const percentChange = (diff / reportData.previousConsumption) * 100;
    const changeText = percentChange >= 0 
      ? `Aumento de ${formatNumber(percentChange)}% em relação à leitura anterior` 
      : `Redução de ${formatNumber(Math.abs(percentChange))}% em relação à leitura anterior`;
    
    doc.text(changeText, 20, yPosition);
    yPosition += lineHeight;
  }
  
  // Footer
  doc.setFontSize(10);
  doc.text(`Relatório gerado em ${format(new Date(), 'dd/MM/yyyy')}`, 20, doc.internal.pageSize.getHeight() - 10);
  
  return doc.output('datauristring');
};

export const generateReportFileName = (type: ReportType, month: string, year: number): string => {
  const typeLabel = type === 'electricity' ? 'energia' : 'agua';
  return `relatorio_${typeLabel}_${month.toLowerCase()}_${year}.pdf`;
};

export const saveReport = async (reportData: ReportData): Promise<boolean> => {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Erro ao gerar relatório",
        description: "Usuário não autenticado."
      });
      return false;
    }
    
    const pdfData = generatePdf(reportData);
    const fileName = generateReportFileName(reportData.type, reportData.month, reportData.year);
    
    const { error } = await supabase
      .from('reports')
      .insert({
        user_id: userId,
        type: reportData.type,
        month: reportData.month,
        year: reportData.year,
        consumption: reportData.consumption,
        daily_average: reportData.dailyAverage,
        cost: reportData.cost,
        file_name: fileName,
        pdf_data: pdfData
      });
    
    if (error) throw error;
    
    toast({
      title: "Relatório salvo",
      description: "Seu relatório foi salvo com sucesso!"
    });
    
    return true;
  } catch (error) {
    console.error("Erro ao salvar relatório:", error);
    toast({
      variant: "destructive",
      title: "Erro ao salvar relatório",
      description: "Não foi possível salvar o relatório."
    });
    return false;
  }
};

export const getReports = async () => {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    if (!userId) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Erro ao buscar relatórios:", error);
    toast({
      variant: "destructive",
      title: "Erro ao carregar relatórios",
      description: "Não foi possível carregar seus relatórios."
    });
    return [];
  }
};
