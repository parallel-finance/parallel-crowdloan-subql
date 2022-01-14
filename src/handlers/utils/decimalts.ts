export function ensureStrNumber(text: string, base?: number): string {
  return BigInt(text).toString(base ? base : 10)
}