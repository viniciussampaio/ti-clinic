/** Parses values like `7d`, `12h`, `30m` into seconds (default: 7 days). */
export function jwtExpiresInSecondsFromEnv(raw?: string): number {
  const value = (raw ?? '7d').trim();
  const match = /^(\d+)([smhd])$/i.exec(value);
  if (!match) {
    return 7 * 24 * 60 * 60;
  }
  const amount = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  const multipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 24 * 60 * 60,
  };
  return amount * (multipliers[unit] ?? 24 * 60 * 60);
}
