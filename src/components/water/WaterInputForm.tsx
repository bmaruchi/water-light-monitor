
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Save } from "lucide-react";

interface WaterInputFormProps {
  previousDate: Date;
  setPreviousDate: (date: Date) => void;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  previousReading: string;
  setPreviousReading: (reading: string) => void;
  reading: string;
  setReading: (reading: string) => void;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  isSaving: boolean;
  handleConfirmValues: () => void;
  handleEditValues: () => void;
  handleSaveReading: () => void;
}

const WaterInputForm: React.FC<WaterInputFormProps> = ({
  previousDate,
  setPreviousDate,
  currentDate,
  setCurrentDate,
  previousReading,
  setPreviousReading,
  reading,
  setReading,
  isEditing,
  isSaving,
  handleConfirmValues,
  handleEditValues,
  handleSaveReading
}) => {
  return (
    <div className="space-y-4">
      {/* Previous Reading Date and Value */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="previous-date">Data da Leitura Anterior</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal input-water"
                disabled={!isEditing}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {previousDate ? format(previousDate, "dd/MM/yyyy") : "Selecione uma data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={previousDate}
                onSelect={(date) => date && setPreviousDate(date)}
                className="rounded-md border"
                disabled={!isEditing}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label htmlFor="previous-reading">Leitura Anterior (m³)</Label>
          <Input
            id="previous-reading"
            type="number"
            placeholder="120"
            value={previousReading}
            onChange={(e) => setPreviousReading(e.target.value)}
            className="input-water"
            disabled={!isEditing}
          />
        </div>
      </div>

      {/* Current Reading Date and Value */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="current-date">Data da Leitura Atual</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal input-water"
                disabled={!isEditing}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {currentDate ? format(currentDate, "dd/MM/yyyy") : "Selecione uma data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={currentDate}
                onSelect={(date) => date && setCurrentDate(date)}
                className="rounded-md border"
                disabled={!isEditing}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label htmlFor="current-reading">Leitura Atual (m³)</Label>
          <Input
            id="current-reading"
            type="number"
            placeholder="130"
            value={reading}
            onChange={(e) => setReading(e.target.value)}
            className="input-water"
            disabled={!isEditing}
          />
        </div>
      </div>
      
      {/* Confirm/Edit Button */}
      <div className="pt-4">
        {isEditing ? (
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700" 
            onClick={handleConfirmValues}
            disabled={!reading || !previousReading}
          >
            Confirmar Valores
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button 
              className="flex-1" 
              variant="outline" 
              onClick={handleEditValues}
            >
              Editar Valores
            </Button>
            <Button 
              className="flex-1 flex items-center gap-2" 
              onClick={handleSaveReading}
              disabled={isSaving}
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Salvando...' : 'Salvar no Supabase'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WaterInputForm;
