export function getBaseUrl() {
  if (typeof window !== 'undefined') return ''; // En el cliente usar ruta relativa
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // URL de Vercel (Server Components)
  return 'http://localhost:3000'; // Local fallback
}
