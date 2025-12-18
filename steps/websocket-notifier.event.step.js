export const config = {
  type: "event",
  name: "websocket-notifier",
  subscribes: ["incident.classified", "workflow.escalated"],
  emits: ["notification.sent"]
};

export async function handler(data, ctx) {
  // WebSocket real-time notifications for classified incidents
  const notification = {
    type: "incident_notification",
    priority: determinePriority(data),
    title: createNotificationTitle(data),
    message: createNotificationMessage(data),
    incidentId: data.id || data.incidentId,
    timestamp: new Date().toISOString(),
    traceId: ctx.traceId,
    actions: getAvailableActions(data)
  };

  ctx.logger.info("🔔 Sending WebSocket notification", {
    priority: notification.priority,
    incidentId: notification.incidentId,
    type: notification.type
  });

  // In production: broadcast to WebSocket clients
  // For demo: simulate WebSocket broadcast
  console.log("🌐 [WEBSOCKET BROADCAST]", JSON.stringify(notification, null, 2));

  // Emit notification event for tracking
  await ctx.emit({
    topic: "notification.sent",
    data: {
      ...notification,
      recipients: ["oncall-engineer", "incident-manager"],
      deliveryMethod: "websocket",
      status: "sent"
    }
  });
}

function determinePriority(data) {
  if (data.severity === "critical" || data.topic === "workflow.escalated") {
    return "critical";
  }
  if (data.severity === "high" || data.recommendation === "escalate") {
    return "high";
  }
  return "normal";
}

function createNotificationTitle(data) {
  const severity = data.severity || "unknown";
  const service = data.service || "unknown";

  if (data.topic === "workflow.escalated") {
    return `🚨 CRITICAL: ${service} incident escalated`;
  }

  return `⚠️ ${severity.toUpperCase()}: ${service} incident detected`;
}

function createNotificationMessage(data) {
  const error = data.error || "unknown error";
  const service = data.service || "unknown service";

  return `${service}: ${error}. ${data.analysis || "Analysis in progress."}`;
}

function getAvailableActions(data) {
  const actions = [
    { label: "View Details", action: "view_incident", incidentId: data.id },
    { label: "Acknowledge", action: "acknowledge", incidentId: data.id }
  ];

  if (data.severity === "critical") {
    actions.push({
      label: "Escalate Now",
      action: "escalate_immediately",
      incidentId: data.id
    });
  }

  return actions;
}