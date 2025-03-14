
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface WaterReading {
  previous_date_reading: Date;
  current_date_reading: Date;
  previous_reading: number;
  current_reading: number;
  consumption: number;
  daily_consumption: number;
  estimated_monthly_consumption: number;
}

export const saveWaterReading = async (reading: WaterReading) => {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }
    
    const { data, error } = await supabase
      .from('water_readings')
      .insert({
        user_id: userId,
        previous_date_reading: reading.previous_date_reading.toISOString(),
        current_date_reading: reading.current_date_reading.toISOString(),
        previous_reading: reading.previous_reading,
        current_reading: reading.current_reading,
        consumption: reading.consumption,
        daily_consumption: reading.daily_consumption,
        estimated_monthly_consumption: reading.estimated_monthly_consumption
      })
      .select();
    
    if (error) throw error;
    
    // Salvar os dados no localStorage para persistência
    localStorage.setItem('water_reading_values', JSON.stringify({
      previous_date_reading: reading.previous_date_reading.toISOString(),
      current_date_reading: reading.current_date_reading.toISOString(),
      previous_reading: reading.previous_reading,
      current_reading: reading.current_reading,
      daily_consumption: reading.daily_consumption
    }));
    
    toast({
      title: "Leitura salva",
      description: "Sua leitura de água foi salva com sucesso!"
    });
    
    return data;
  } catch (error) {
    console.error("Erro ao salvar leitura de água:", error);
    toast({
      variant: "destructive",
      title: "Erro ao salvar",
      description: "Não foi possível salvar a leitura de água."
    });
    return null;
  }
};

export const getWaterReadings = async () => {
  try {
    const { data, error } = await supabase
      .from('water_readings')
      .select('*')
      .order('current_date_reading', { ascending: false });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Erro ao buscar leituras de água:", error);
    toast({
      variant: "destructive",
      title: "Erro ao carregar dados",
      description: "Não foi possível carregar as leituras de água."
    });
    return [];
  }
};

export const getLastWaterReading = async () => {
  try {
    // Primeiro, verificar se temos dados no localStorage
    const savedData = localStorage.getItem('water_reading_values');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      return parsedData;
    }
    
    // Se não houver dados no localStorage, buscar do banco
    const { data, error } = await supabase
      .from('water_readings')
      .select('*')
      .order('current_date_reading', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) throw error;
    
    if (data) {
      // Salvar no localStorage para persistência
      localStorage.setItem('water_reading_values', JSON.stringify({
        previous_date_reading: data.current_date_reading,
        current_date_reading: new Date().toISOString(),
        previous_reading: data.current_reading,
        current_reading: '',
        daily_consumption: data.daily_consumption
      }));
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao buscar última leitura de água:", error);
    return null;
  }
};
