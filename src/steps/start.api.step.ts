import type { StepConfig, Incident, StepContext } from '../types'

export const config: StepConfig = {
  type: "api",
  name: "incident-api",
  method: "POST",
  path: "/incident",
  emits: ["incident.received"]
};

export async function handler(data: any, ctx: StepContext): Promise<{ status: number; body: any }> {
  const incident: Incident = {
    id: Math.floor(Math.random() * 10000),
    service: data?.body?.service || "unknown",
    error: data?.body?.error || "unspecified",
    severityHint: data?.body?.severity || "unknown",
    time: new Date().toISOString()
  };

  ctx.logger.info("🚨 Incident received", incident);

  await ctx.emit({
    topic: "incident.received",
    data: incident
  });

  return {
    status: 200,
    body: {
      message: "Incident received",
      incidentId: incident.id
    }
  };
}
