import { readFileSync, writeFileSync, existsSync, unlinkSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

export const config = {
  type: "event",
  name: "auto-remediate",
  subscribes: ["incident.ready_for_remediation"],
  emits: ["incident.escalated"]
};

export async function handler(data, ctx) {
  const attemptFile = join(tmpdir(), `remediate-${data.id}.txt`);
  
  let attempts = 0;
  if (existsSync(attemptFile)) {
    attempts = parseInt(readFileSync(attemptFile, "utf-8"), 10);
  }
  
  attempts += 1;
  writeFileSync(attemptFile, String(attempts));

  ctx.logger.warn("🔧 Auto-remediation attempt", {
    incidentId: data.id,
    attempts,
    severity: data.severity
  });

  // 🚨 Stop after 3 attempts → escalate to human
  if (attempts >= 3) {
    ctx.logger.error("🚨 Escalating incident", {
      incidentId: data.id,
      attempts,
      severity: data.severity
    });

    // Clean up attempt file
    if (existsSync(attemptFile)) {
      unlinkSync(attemptFile);
    }

    // Emit escalation event
    await ctx.emit({
      topic: "incident.escalated",
      data: {
        ...data,
        failedAttempts: attempts,
        escalatedAt: new Date().toISOString(),
        reason: "Auto-remediation exhausted - requires human intervention"
      }
    });
    
    return; // Don't throw - just exit after escalation
  }

  // Retry if attempts < 3
  throw new Error(`Remediation failed (attempt ${attempts}). Will retry.`);
}
