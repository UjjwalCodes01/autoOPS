export const config = {
  type: "event",
  name: "intelligent-router",
  subscribes: ["incident.analyzed"],
  emits: ["incident.ready_for_remediation", "incident.ready_for_escalation"]
};

export async function handler(data, ctx) {
  ctx.logger.info("🎯 Intelligent Router", {
    incidentId: data.id,
    recommendation: data.recommendation,
    confidence: data.confidence
  });

  // Route based on AI recommendation and confidence
  if (
    data.recommendation === "escalate" ||
    data.severity === "critical" ||
    data.confidence < 0.6
  ) {
    ctx.logger.warn("⬆️ Routing to escalation", {
      incidentId: data.id,
      reason: `${data.recommendation} | confidence: ${data.confidence}`
    });

    await ctx.emit({
      topic: "incident.ready_for_escalation",
      data
    });
  } else {
    ctx.logger.info("🔧 Routing to remediation", {
      incidentId: data.id,
      action: data.suggestedAction
    });

    await ctx.emit({
      topic: "incident.ready_for_remediation",
      data
    });
  }
}
