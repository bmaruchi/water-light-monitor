
import { supabase } from "@/integrations/supabase/client";
import { generatePdf } from "@/lib/pdfGenerator";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

export type ReportType = "electricity" | "water";

export interface ReportData {
  type: ReportType;
  month: string;
  year: number;
  consumption: number;
  dailyAverage: number;
  cost?: number;
  readings: any[];
}

export interface StoredReport {
  id: string;
  userId: string;
  type: ReportType;
  month: string;
  year: number;
  consumption: number;
  dailyAverage: number;
  cost: number;
  fileName: string;
  pdfData: string;
  createdAt: string;
}

export const generateReport = async (data: ReportData): Promise<StoredReport | null> => {
  try {
    const fileName = `relatorio_${data.type === 'electricity' ? 'energia' : 'agua'}_${data.month.toLowerCase()}_${data.year}.pdf`;
    const { pdfBase64 } = await generatePdf(data);
    
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }
    
    const { data: reportData, error } = await supabase
      .from('reports')
      .insert({
        user_id: userId,
        type: data.type,
        month: data.month,
        year: data.year,
        consumption: data.consumption,
        daily_average: data.dailyAverage,
        cost: data.cost || 0,
        file_name: fileName,
        pdf_data: pdfBase64
      })
      .select()
      .single();
    
    if (error) throw error;
    
    toast({
      title: "Relatório gerado",
      description: `Relatório de ${data.type === 'electricity' ? 'energia' : 'água'} para ${data.month}/${data.year} gerado com sucesso.`
    });
    
    return {
      id: reportData.id,
      userId: reportData.user_id,
      type: reportData.type as ReportType,
      month: reportData.month,
      year: reportData.year,
      consumption: reportData.consumption,
      dailyAverage: reportData.daily_average,
      cost: reportData.cost,
      fileName: reportData.file_name,
      pdfData: reportData.pdf_data,
      createdAt: reportData.created_at
    };
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    toast({
      variant: "destructive",
      title: "Erro ao gerar relatório",
      description: "Não foi possível gerar o relatório. Tente novamente mais tarde."
    });
    return null;
  }
};

export const getReports = async (): Promise<StoredReport[]> => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(report => ({
      id: report.id,
      userId: report.user_id,
      type: report.type as ReportType,
      month: report.month,
      year: report.year,
      consumption: report.consumption,
      dailyAverage: report.daily_average,
      cost: report.cost,
      fileName: report.file_name,
      pdfData: report.pdf_data,
      createdAt: report.created_at
    }));
  } catch (error) {
    console.error("Erro ao buscar relatórios:", error);
    toast({
      variant: "destructive",
      title: "Erro ao carregar relatórios",
      description: "Não foi possível carregar os relatórios. Tente novamente mais tarde."
    });
    return [];
  }
};

export const deleteReport = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    toast({
      title: "Relatório excluído",
      description: "O relatório foi excluído com sucesso."
    });
    
    return true;
  } catch (error) {
    console.error("Erro ao excluir relatório:", error);
    toast({
      variant: "destructive",
      title: "Erro ao excluir relatório",
      description: "Não foi possível excluir o relatório. Tente novamente mais tarde."
    });
    return false;
  }
};
