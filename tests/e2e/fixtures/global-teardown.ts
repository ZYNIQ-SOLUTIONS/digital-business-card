export default async function globalTeardown() {
  try {
    await fetch("http://127.0.0.1:54321/__shutdown");
    console.log("[global-teardown] Mock Supabase server shutdown signal sent.");
  } catch {
    // Ignore error if already stopped
  }
}
