export const config = {
  type: "api",
  name: "health-check",
  method: "GET",
  path: "/health",
  emits: []
};

export async function handler(data, ctx) {
  // Simple health check endpoint
  return {
    status: 200,
    body: {
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      uptime: process.uptime(),
      service: "AutoOps Incident Response"
    }
  };
}