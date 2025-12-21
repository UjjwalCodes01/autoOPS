import type { StepConfig, Incident, ClassifiedIncident, StepContext } from '../types'

export const config: StepConfig = {
  type: "event",
  name: "incident-classifier",
  subscribes: ["incident.received"],
  emits: ["incident.classified"]
};

export async function handler(data: Incident, ctx: StepContext): Promise<void> {
  // 🧠 AI Logic: Classify severity
  const severity = determineSeverity(data.severityHint, data.error);

  ctx.logger.info("🧠 Incident classified", {
    incidentId: data.id,
    service: data.service,
    severity
  });

  await ctx.emit({
    topic: "incident.classified",
    data: {
      ...data,
      severity,
      classifiedAt: new Date().toISOString()
    }
  });
}

function determineSeverity(hint: string, error: string): "critical" | "high" | "medium" | "low" {
  // AI-like logic: determine if this needs auto-remediation or immediate escalation
  const errorLower = error.toLowerCase();
  const hintLower = hint.toLowerCase();
  
  // Critical indicators
  if (hintLower === "critical" || 
      errorLower.includes("pool exhausted") ||
      errorLower.includes("outage") ||
      errorLower.includes("down")) {
    return "critical";
  }
  
  // High severity
  if (hintLower === "high" || 
      errorLower.includes("timeout") || 
      errorLower.includes("crash") ||
      errorLower.includes("error")) {
    return "high";
  }
  
  // Medium severity
  if (hintLower === "medium" || errorLower.includes("warning")) {
    return "medium";
  }
  
  return "low";
}
