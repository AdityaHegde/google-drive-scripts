export function waitForMS(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
