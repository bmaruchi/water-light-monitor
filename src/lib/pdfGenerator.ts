
import jsPDF from 'jspdf';
import { formatCurrency, formatNumber } from './calculations';

interface ReportData {
  type: 'electricity' | 'water';
  month: string;
  year: number;
  consumption: number;
  dailyAverage: number;
  cost?: number;
  previousConsumption?: number;
  percentageChange?: number;
}

export const generateMonthlyReport = (data: ReportData): jsPDF => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  doc.text('Monitor de Consumo', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(16);
  const title = `Relatório de ${data.type === 'electricity' ? 'Energia' : 'Água'} - ${data.month}/${data.year}`;
  doc.text(title, pageWidth / 2, 30, { align: 'center' });
  
  doc.setDrawColor(0, 0, 0);
  doc.line(20, 35, pageWidth - 20, 35);
  
  // Content
  doc.setFontSize(12);
  let yPos = 50;
  
  doc.text(`Consumo Total: ${formatNumber(data.consumption)} ${data.type === 'electricity' ? 'kWh' : 'm³'}`, 20, yPos);
  yPos += 10;
  
  doc.text(`Média Diária: ${formatNumber(data.dailyAverage, 3)} ${data.type === 'electricity' ? 'kWh' : 'm³'}`, 20, yPos);
  yPos += 10;
  
  if (data.cost !== undefined) {
    doc.text(`Custo Estimado: ${formatCurrency(data.cost)}`, 20, yPos);
    yPos += 10;
  }
  
  if (data.previousConsumption !== undefined) {
    doc.text(`Consumo Anterior: ${formatNumber(data.previousConsumption)} ${data.type === 'electricity' ? 'kWh' : 'm³'}`, 20, yPos);
    yPos += 10;
    
    if (data.percentageChange !== undefined) {
      const changeText = data.percentageChange >= 0 
        ? `Aumento: ${formatNumber(data.percentageChange)}%` 
        : `Redução: ${formatNumber(Math.abs(data.percentageChange))}%`;
      
      doc.text(changeText, 20, yPos);
      yPos += 10;
    }
  }
  
  // Footer
  yPos = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(10);
  doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, yPos, { align: 'center' });
  
  return doc;
};

export const downloadPDF = (doc: jsPDF, fileName: string): void => {
  doc.save(fileName);
};
