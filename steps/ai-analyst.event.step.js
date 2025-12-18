export const config = {
  type: "event",
  name: "ai-analyst",
  subscribes: ["incident.classified"],
  emits: ["incident.analyzed"]
};

export async function handler(data, ctx) {
  // 🤖 Intelligent Incident Analysis Engine with Advanced State
  // Using simple state management for reliability

  // Initialize state for this incident
  const incidentKey = `incident:${data.id}`;
  
  // Use a simple in-memory state for demo (in production: ctx.state)
  if (!global.incidentStates) {
    global.incidentStates = new Map();
  }
  
  let state = global.incidentStates.get(incidentKey);
  if (!state) {
    state = {
      analysisCount: 0,
      lastAnalyzed: null,
      confidenceHistory: [],
      recommendations: []
    };
  }

  // Update analysis count
  state.analysisCount += 1;
  state.lastAnalyzed = new Date().toISOString();

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

  // Update state with analysis results
  state.confidenceHistory.push(analysis.confidence);
  state.recommendations.push(analysis.recommendation);

  // Calculate trend confidence (improves with multiple analyses)
  const avgConfidence = state.confidenceHistory.reduce((a, b) => a + b, 0) / state.confidenceHistory.length;
  analysis.confidence = Math.min(avgConfidence + 0.1, 1.0); // Slight boost for consistency

  // Save updated state
  global.incidentStates.set(incidentKey, state);

  ctx.logger.info("🤖 AI Analysis Complete (with state)", {
    incidentId: data.id,
    service: data.service,
    recommendation: analysis.recommendation,
    confidence: analysis.confidence,
    analysisCount: state.analysisCount,
    stateKey: incidentKey
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
      analyzedAt: new Date().toISOString(),
      state: state // Include state in event for other steps
    }
  });
}
