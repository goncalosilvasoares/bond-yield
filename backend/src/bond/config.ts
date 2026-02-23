/**
 * Configuration constants for bond calculations.
 * Values can be overridden via environment variables for testing or tuning.
 */
export const HIGH_RATE_LIMIT = Number(process.env.HIGH_RATE_LIMIT) || 100;
export const MAX_BRACKET_ATTEMPTS =
  Number(process.env.MAX_BRACKET_ATTEMPTS) || 100;
export const MAX_ITERATIONS = Number(process.env.MAX_ITERATIONS) || 200;
export const YTM_TOLERANCE = Number(process.env.YTM_TOLERANCE) || 1e-8;
