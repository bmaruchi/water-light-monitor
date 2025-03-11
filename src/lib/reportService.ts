
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

// In a real app, this would interact with a backend API
// For now, we'll use localStorage for simplicity
export const saveReport = (report: Omit<StoredReport, 'id' | 'createdAt'>): StoredReport => {
  const id = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const createdAt = new Date().toISOString();
  
  const newReport: StoredReport = {
    id,
    createdAt,
    ...report
  };
  
  // Get existing reports from localStorage
  const storedReportsJSON = localStorage.getItem('savedReports');
  const storedReports: StoredReport[] = storedReportsJSON ? JSON.parse(storedReportsJSON) : [];
  
  // Add new report
  storedReports.push(newReport);
  
  // Save back to localStorage
  localStorage.setItem('savedReports', JSON.stringify(storedReports));
  
  return newReport;
};

export const getUserReports = (userId: string): StoredReport[] => {
  const storedReportsJSON = localStorage.getItem('savedReports');
  if (!storedReportsJSON) return [];
  
  const storedReports: StoredReport[] = JSON.parse(storedReportsJSON);
  return storedReports.filter(report => report.userId === userId);
};

export const deleteReport = (reportId: string): boolean => {
  const storedReportsJSON = localStorage.getItem('savedReports');
  if (!storedReportsJSON) return false;
  
  const storedReports: StoredReport[] = JSON.parse(storedReportsJSON);
  const updatedReports = storedReports.filter(report => report.id !== reportId);
  
  localStorage.setItem('savedReports', JSON.stringify(updatedReports));
  return true;
};

export const generateReportFileName = (type: 'electricity' | 'water', month: string, year: number): string => {
  const typeText = type === 'electricity' ? 'energia' : 'agua';
  return `relatorio_${typeText}_${month}_${year}.pdf`;
};

// Export the StoredReport interface for use in components
export type { StoredReport };
