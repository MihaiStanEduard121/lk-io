/**
 * Returns strictly the REAL live viewer numbers from actual presence session pings.
 * No artificial multipliers or invented figures.
 */
export function getCalculatedLiveViewers(
  id: string,
  title?: string,
  category?: string,
  rating?: number,
  realPresenceCount: number = 0
): number {
  return Math.max(0, realPresenceCount);
}

/**
 * Formats viewer count for Romanian UI display
 * e.g., 0 -> "0", 5 -> "5", 1420 -> "1.420"
 */
export function formatViewerCount(count: number): string {
  return new Intl.NumberFormat('ro-RO').format(count);
}
