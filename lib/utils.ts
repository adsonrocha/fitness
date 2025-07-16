import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Exercise, TrainingDay } from "@lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractWeekOptions(
  treinoData: TrainingDay[]
): Array<{ value: string; label: string; number: number }> {
  // Coletar todas as chaves únicas dos atributos weeks dos exercícios
  const weekKeySet = new Set<string>();
  treinoData.forEach((day) => {
    day.exercises.forEach((exercise: Exercise) => {
      Object.keys(exercise.weeks).forEach((key) => weekKeySet.add(key));
    });
  });

  // Ordenar as chaves de forma natural (ex: 1e5, 2e6, ...)
  const sortedKeys = Array.from(weekKeySet).sort((a, b) => {
    const numA = parseInt(a);
    const numB = parseInt(b);
    return numA - numB;
  });

  // Gerar os weekOptions
  return sortedKeys.map((key, idx) => ({
    value: key,
    label: `Semanas ${key.replace("e", " e ")}`,
    number: idx + 1,
  }));
}

export const getPEColor = (details: string) => {
  if (details.includes('PE5')) return 'bg-red-500'
  if (details.includes('PE4')) return 'bg-orange-500'
  if (details.includes('PE3')) return 'bg-yellow-500'
  return 'bg-green-500'
}

export const getPEDescription = (pe: string) => {
  const descriptions: Record<string, string> = {
    'PE3': 'Moderado (1 rep na reserva)',
    'PE4': 'Intenso (Falha completa)',
    'PE5': 'Máximo (Falha parcial)'
  }
  return descriptions[pe] || 'Leve'
}
