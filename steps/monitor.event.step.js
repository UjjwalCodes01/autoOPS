export const config = {
  type: "event",
  name: "incident-monitor",
  subscribes: ["incident.ready_for_monitoring"],
  emits: ["incident.monitoring_complete"]
};

export async function handler(data, ctx) {
  ctx.logger.info("👁️ Monitoring incident (no auto-remediation)", {
    incidentId: data.id,
    service: data.service,
    severity: data.severity,
    recommendation: data.recommendation
  });

  // For monitoring incidents, we just log and track
  // In production, this might add to a monitoring dashboard or backlog

  ctx.logger.info("📝 Incident logged for monitoring", {
    incidentId: data.id,
    action: data.suggestedAction || "Log incident for later investigation",
    nextSteps: "Add to backlog if pattern emerges"
  });

  // Emit completion for workflow tracking
  await ctx.emit({
    topic: "incident.monitoring_complete",
    data: {
      ...data,
      monitoringStarted: new Date().toISOString(),
      status: "monitoring"
    }
  });
}