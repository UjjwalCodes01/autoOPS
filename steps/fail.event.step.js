import { readFileSync, writeFileSync, existsSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

export const config = {
  type: "event",
  name: "auto-remediate",
  subscribes: ["incident.classified"],
  emits: ["incident.escalated"]
};

export async function handler(data, ctx) {
  const attemptFile = join(tmpdir(), `incident-${data.id}.txt`);

  let attempts = 0;
  if (existsSync(attemptFile)) {
    attempts = Number(readFileSync(attemptFile, "utf-8"));
  }

  attempts++;
  writeFileSync(attemptFile, String(attempts));

  ctx.logger.warn("🔧 Auto-remediation attempt", {
    incidentId: data.id,
    attempts,
    severity: data.severity
  });

  // Fail first 2 attempts to simulate remediation failure
  if (attempts < 3) {
    throw new Error("Auto-remediation failed, retrying");
  }

  // Fail first 3 attempts
if (attempts < 4) {
  throw new Error("Auto-remediation failed, retrying");
}

// If still failing and severity is high → escalate
if (data.severity === "high") {
  ctx.logger.error("🚨 Escalating incident", {
    incidentId: data.id,
    attempts,
    severity: data.severity
  });

  await ctx.emit({
    topic: "incident.escalated",
    data
  });

  return;
}


  ctx.logger.info("✅ Incident auto-resolved", {
    incidentId: data.id,
    attempts
  });

  return {
    status: "resolved",
    incidentId: data.id,
    attempts
  };
}
