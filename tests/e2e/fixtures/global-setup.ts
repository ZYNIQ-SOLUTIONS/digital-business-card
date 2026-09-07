import { spawn } from "child_process";
import path from "path";

async function isServerRunning(): Promise<boolean> {
  try {
    const res = await fetch("http://127.0.0.1:54321/__health");
    return res.status === 200;
  } catch {
    return false;
  }
}

export default async function globalSetup() {
  const alreadyRunning = await isServerRunning();
  if (alreadyRunning) {
    console.log("[global-setup] Mock Supabase server is already running on port 54321.");
    return;
  }

  console.log("[global-setup] Launching Mock Supabase server...");
  const serverPath = path.resolve(__dirname, "run-mock-server.js");
  const child = spawn("node", [serverPath], {
    detached: true,
    stdio: "ignore",
  });
  child.unref();

  // Poll until server is ready
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 200));
    if (await isServerRunning()) {
      console.log("[global-setup] Mock Supabase server is ready.");
      return;
    }
  }

  throw new Error("[global-setup] Timed out waiting for Mock Supabase server to start.");
}
