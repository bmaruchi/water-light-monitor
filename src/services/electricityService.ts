
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ElectricityReading {
  previous_date_reading: Date;
  current_date_reading: Date;
  previous_reading: number;
  current_reading: number;
  kwh_price: number;
  flag_type: string;
  flag_value: number;
  public_lighting: number;
  consumption: number;
  daily_consumption: number;
  estimated_cost: number;
}

export const saveElectricityReading = async (reading: ElectricityReading) => {
  try {
    const { data, error } = await supabase
      .from('electricity_readings')
      .insert({
        ...reading,
        user_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select();

    if (error) throw error;
    
    toast({
      title: "Leitura salva",
      description: "Sua leitura de energia foi salva com sucesso!"
    });
    
    return data;
  } catch (error) {
    console.error("Erro ao salvar leitura de energia:", error);
    toast({
      variant: "destructive",
      title: "Erro ao salvar",
      description: "Não foi possível salvar a leitura de energia."
    });
    return null;
  }
};

export const getElectricityReadings = async () => {
  try {
    const { data, error } = await supabase
      .from('electricity_readings')
      .select('*')
      .order('current_date_reading', { ascending: false });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Erro ao buscar leituras de energia:", error);
    toast({
      variant: "destructive",
      title: "Erro ao carregar dados",
      description: "Não foi possível carregar as leituras de energia."
    });
    return [];
  }
};

export const getLastElectricityReading = async () => {
  try {
    const { data, error } = await supabase
      .from('electricity_readings')
      .select('*')
      .order('current_date_reading', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Erro ao buscar última leitura de energia:", error);
    return null;
  }
};
