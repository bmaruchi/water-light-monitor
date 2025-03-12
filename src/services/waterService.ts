
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
    const { data, error } = await supabase
      .from('water_readings')
      .insert({
        ...reading,
        user_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select();
    
    if (error) throw error;
    
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
    const { data, error } = await supabase
      .from('water_readings')
      .select('*')
      .order('current_date_reading', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Erro ao buscar última leitura de água:", error);
    return null;
  }
};
