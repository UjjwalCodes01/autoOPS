// AutoOps Type Definitions

export interface Incident {
  id: number;
  service: string;
  error: string;
  severityHint: string;
  time: string;
}

export interface ClassifiedIncident extends Incident {
  severity: "critical" | "high" | "medium" | "low";
  classification: string;
}

export interface AnalyzedIncident extends ClassifiedIncident {
  recommendation: "remediate" | "escalate" | "monitor";
  confidence: number;
  analysis: string;
}

export interface StepContext {
  logger: Logger;
  emit: (event: EventEmission) => Promise<void>;
  state: StateManager;
}

export interface Logger {
  info: (message: string, data?: any) => void;
  error: (message: string, error?: any) => void;
  warn: (message: string, data?: any) => void;
  debug: (message: string, data?: any) => void;
}

export interface EventEmission {
  topic: string;
  data: any;
}

export interface StateManager {
  get: (key: string) => Promise<any>;
  set: (key: string, value: any) => Promise<void>;
  delete: (key: string) => Promise<void>;
}

export interface StepConfig {
  type: "api" | "event" | "cron" | "job";
  name: string;
  method?: string;
  path?: string;
  subscribes?: string[];
  emits?: string[];
  schedule?: string;
}
