export const config = {
  type: "api",
  name: "incident-api",
  method: "POST",
  path: "/incident",
  emits: ["incident.received"]
};

export async function handler(data, ctx) {
  console.log("Raw data received:", JSON.stringify(data));
  
  const incident = {
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
