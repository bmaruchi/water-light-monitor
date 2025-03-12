
import { supabase } from "@/integrations/supabase/client";
import { generateMonthlyReport } from './pdfGenerator';

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
  pdfData?: string; // Base64 encoded PDF
}

export const saveReport = async (report: Omit<StoredReport, 'id' | 'createdAt'>): Promise<StoredReport | null> => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .insert({
        user_id: report.userId,
        type: report.type,
        month: report.month,
        year: report.year,
        consumption: report.consumption,
        daily_average: report.dailyAverage,
        cost: report.cost,
        file_name: report.fileName,
        pdf_data: report.pdfData
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      month: data.month,
      year: data.year,
      consumption: data.consumption,
      dailyAverage: data.daily_average,
      cost: data.cost,
      fileName: data.file_name,
      pdfData: data.pdf_data,
      createdAt: data.created_at
    };
  } catch (error) {
    console.error('Erro ao salvar relatório:', error);
    return null;
  }
};

export const getUserReports = async (userId: string): Promise<StoredReport[]> => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(report => ({
      id: report.id,
      userId: report.user_id,
      type: report.type,
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
    console.error('Erro ao obter relatórios:', error);
    return [];
  }
};

export const deleteReport = async (reportId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', reportId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Erro ao excluir relatório:', error);
    return false;
  }
};

export const generateReportFileName = (type: 'electricity' | 'water', month: string, year: number): string => {
  const typeText = type === 'electricity' ? 'energia' : 'agua';
  return `relatorio_${typeText}_${month}_${year}.pdf`;
};

// Export the StoredReport interface for use in components
export type { StoredReport };
