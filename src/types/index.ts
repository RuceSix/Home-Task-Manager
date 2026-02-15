export interface Device {
  id: string;
  name: string;
  room: string;
  status: boolean;
}

export interface Automation {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

// Re-export taskmate types
export * from './taskmate';
