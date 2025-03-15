
import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Save } from "lucide-react";

interface ElectricityInputFormProps {
  previousDate: Date;
  setPreviousDate: (date: Date) => void;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  previousReading: string;
  setPreviousReading: (reading: string) => void;
  reading: string;
  setReading: (reading: string) => void;
  kwhPrice: string;
  setKwhPrice: (price: string) => void;
  flagType: string;
  setFlagType: Dispatch<SetStateAction<"green" | "yellow" | "red1" | "red2">>;
  publicLighting: string;
  setPublicLighting: (value: string) => void;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  isSaving: boolean;
  handleConfirmValues: () => void;
  handleEditValues: () => void;
  handleSaveReading: () => void;
  flagValues: Record<string, { name: string; value: number }>;
}

const ElectricityInputForm: React.FC<ElectricityInputFormProps> = ({
  previousDate,
  setPreviousDate,
  currentDate,
  setCurrentDate,
  previousReading,
  setPreviousReading,
  reading,
  setReading,
  kwhPrice,
  setKwhPrice,
  flagType,
  setFlagType,
  publicLighting,
  setPublicLighting,
  isEditing,
  isSaving,
  handleConfirmValues,
  handleEditValues,
  handleSaveReading,
  flagValues
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
                className="w-full justify-start text-left font-normal"
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
          <Label htmlFor="previous-reading">Leitura Anterior (kWh)</Label>
          <Input
            id="previous-reading"
            type="number"
            placeholder="1250"
            value={previousReading}
            onChange={(e) => setPreviousReading(e.target.value)}
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
                className="w-full justify-start text-left font-normal"
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
          <Label htmlFor="current-reading">Leitura Atual (kWh)</Label>
          <Input
            id="current-reading"
            type="number"
            placeholder="1350"
            value={reading}
            onChange={(e) => setReading(e.target.value)}
            disabled={!isEditing}
          />
        </div>
      </div>

      {/* Price and Public Lighting */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="kwh-price">Valor do kWh (R$)</Label>
          <Input
            id="kwh-price"
            type="number"
            step="0.01"
            placeholder="0.70"
            value={kwhPrice}
            onChange={(e) => setKwhPrice(e.target.value)}
            disabled={!isEditing}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="public-lighting">Iluminação Pública (R$)</Label>
          <Input
            id="public-lighting"
            type="number"
            step="0.01"
            placeholder="35.80"
            value={publicLighting}
            onChange={(e) => setPublicLighting(e.target.value)}
            disabled={!isEditing}
          />
        </div>
      </div>

      {/* Flag Selection */}
      <div className="space-y-2">
        <Label htmlFor="flag-type">Bandeira Tarifária</Label>
        <select 
          id="flag-type"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={flagType}
          onChange={(e) => setFlagType(e.target.value as "green" | "yellow" | "red1" | "red2")}
          disabled={!isEditing}
        >
          {Object.entries(flagValues).map(([key, { name }]) => (
            <option key={key} value={key}>{name}</option>
          ))}
        </select>
      </div>
      
      {/* Confirm/Edit Button */}
      <div className="pt-4">
        {isEditing ? (
          <Button 
            className="w-full bg-amber-600 hover:bg-amber-700" 
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

export default ElectricityInputForm;
