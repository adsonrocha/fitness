export interface Exercise {
  weeks: Record<string, unknown>;
  // Add other exercise properties as needed
}

export interface TrainingDay {
  exercises: Exercise[];
  // Add other day properties as needed
}

export interface ProcessedJson {
  // Add structure of your JSON response
  [key: string]: unknown;
}