export const config = {
  type: "event",
  name: "hello-step",
  subscribes: ["autoops.start"],
  emits: []
};

export async function handler(data,ctx) {
  console.log("✅ Event received: autoops.start");
  console.log("Payload:", data);

  return {
    status: "ok",
    message: "Event step executed"
  };
}
