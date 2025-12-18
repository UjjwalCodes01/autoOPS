export const config = {
  type: "event",
  name: "ai-analyst",
  subscribes: ["incident.classified"],
  emits: ["incident.analyzed"]
};

export async function handler(data, ctx) {
  // 🤖 Intelligent Incident Analysis Engine
  // Uses heuristic AI logic for reliable incident prioritization
  
  const service = data.service.toLowerCase();
  const errorMsg = data.error.toLowerCase();
  const severity = data.severity.toLowerCase();

  let analysis = {
    analysis: "Running intelligent incident analysis...",
    recommendation: "attempt_remediation",
    suggested_action: "Monitoring",
    confidence: 0.5
  };

  // Critical path: Immediate escalation needed
  if (
    severity === "critical" ||
    errorMsg.includes("down") ||
    errorMsg.includes("outage") ||
    errorMsg.includes("crash") ||
    (service === "auth" && errorMsg.includes("fail")) ||
    (service === "payment" && errorMsg.includes("fail"))
  ) {
    analysis = {
      analysis: "🚨 CRITICAL: Production system down or critical service failure detected. Immediate human intervention required.",
      recommendation: "escalate",
      suggested_action: "Page on-call engineer immediately. Create incident in status page. Alert stakeholders.",
      confidence: 0.95
    };
  }
  // High severity path: Try auto-remediation first
  else if (
    severity === "high" ||
    errorMsg.includes("timeout") ||
    errorMsg.includes("pool exhausted") ||
    errorMsg.includes("too many") ||
    errorMsg.includes("overload")
  ) {
    analysis = {
      analysis: "⚠️  HIGH: Resource exhaustion or performance degradation detected. Auto-remediation recommended with close monitoring.",
      recommendation: "attempt_remediation",
      suggested_action: "Trigger auto-scaling. Restart affected service instances. Monitor error rate closely.",
      confidence: 0.85
    };
  }
  // Medium severity: Monitor and gather info
  else if (severity === "medium" || errorMsg.includes("error")) {
    analysis = {
      analysis: "📊 MEDIUM: Non-critical error detected. Safe to attempt automated recovery.",
      recommendation: "attempt_remediation",
      suggested_action: "Execute standard remediation procedures. Log detailed diagnostics.",
      confidence: 0.75
    };
  }
  // Low severity: Monitor
  else {
    analysis = {
      analysis: "📝 LOW: Minor issue detected. Monitoring recommended.",
      recommendation: "monitor",
      suggested_action: "Log incident for later investigation. Add to backlog if pattern emerges.",
      confidence: 0.6
    };
  }

  ctx.logger.info("🤖 AI Analysis Complete", {
    incidentId: data.id,
    service: data.service,
    recommendation: analysis.recommendation,
    confidence: analysis.confidence
  });

  // Emit analyzed incident
  await ctx.emit({
    topic: "incident.analyzed",
    data: {
      ...data,
      analysis: analysis.analysis,
      recommendation: analysis.recommendation,
      suggestedAction: analysis.suggested_action,
      confidence: analysis.confidence,
      analyzedAt: new Date().toISOString()
    }
  });
}
