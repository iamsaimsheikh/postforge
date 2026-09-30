import cron from "node-cron";
import { loadConfig } from "./config.js";

const config = loadConfig();

console.log(`[postforge] Scheduler started for: ${config.name}`);
console.log(`[postforge] Schedule: ${config.schedule} (${config.timezone})`);
console.log(`[postforge] Waiting for next run...`);

cron.schedule(
  config.schedule,
  async () => {
    console.log(`[postforge] Cron triggered at ${new Date().toISOString()}`);
    try {
      await import("./index.js");
    } catch (err) {
      console.error("[postforge] Scheduled run failed:", err);
    }
  },
  { timezone: config.timezone },
);
