export default async function handler(_req, res) {
  res.status(200).json({
    ok: true,
    agent: "Nery",
    runtime: "vercel",
    model: process.env.NERY_MODEL || "openai/gpt-5.6-sol",
    gatewayConfigured: Boolean(process.env.AI_GATEWAY_API_KEY)
  });
}
