import { SupportRepository } from './src/modules/support/support.repository.js';

async function run() {
  const repo = new SupportRepository();
  try {
    const data = await repo.findAll();
    console.log("findAll success:", data.length, "tickets found.");
  } catch (error) {
    console.error("findAll error:", error);
  }
  process.exit(0);
}
run();
