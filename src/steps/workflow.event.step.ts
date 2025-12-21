export const config = {
  type: "event",
  name: "incident-workflow",
  subscribes: ["incident.analyzed"],
  emits: ["workflow.completed", "workflow.escalated", "incident.ready_for_remediation"]
};

export async function handler(data, ctx) {
  ctx.logger.info("🔀 Starting incident workflow", {
    incidentId: data.id,
    severity: data.severity,
    recommendation: data.recommendation
  });

  // Complex branching logic based on multiple factors
  const workflow = {
    steps: [],
    currentStep: 0,
    completed: false
  };

  // Step 1: Initial assessment
  workflow.steps.push({
    name: "assessment",
    status: "completed",
    result: data.recommendation
  });

  // Step 2: Route based on severity + recommendation
  if (data.severity === "critical") {
    workflow.steps.push({
      name: "critical-path",
      status: "active",
      actions: ["page-oncall", "create-incident", "notify-stakeholders"]
    });

    await ctx.emit({
      topic: "workflow.escalated",
      data: {
        ...data,
        workflow,
        escalationReason: "Critical severity requires immediate human intervention"
      }
    });
  } else if (data.recommendation === "attempt_remediation") {
    workflow.steps.push({
      name: "remediation-path",
      status: "active",
      actions: ["auto-scale", "restart-services", "monitor-metrics"]
    });

    await ctx.emit({
      topic: "incident.ready_for_remediation",
      data: {
        ...data,
        workflow
      }
    });
  } else {
    workflow.steps.push({
      name: "monitoring-path",
      status: "active",
      actions: ["log-incident", "add-to-backlog", "schedule-review"]
    });

    await ctx.emit({
      topic: "workflow.completed",
      data: {
        ...data,
        workflow,
        resolution: "monitored"
      }
    });
  }

  ctx.logger.info("🔀 Workflow routing completed", {
    incidentId: data.id,
    path: workflow.steps[1].name,
    actions: workflow.steps[1].actions
  });
}