export const config = {
  type: "event",
  name: "incident-classifier",
  subscribes: ["incident.received"],
  emits: ["incident.classified"]
};

export async function handler(data, ctx) {
  // Simple AI / rule-based classification (demo-safe)
  let severity = "low";

  if (
    data.severityHint === "high" ||
    data.service === "payments" ||
    data.error.toLowerCase().includes("timeout")
  ) {
    severity = "high";
  } else if (data.severityHint === "medium") {
    severity = "medium";
  }

  ctx.logger.info("🧠 Incident classified", {
    incidentId: data.id,
    service: data.service,
    severity
  });

  await ctx.emit({
    topic: "incident.classified",
    data: {
      ...data,
      severity
    }
  });
}
