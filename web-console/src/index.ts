import { fetchHiveStatus } from "./api";

async function main() {
  const status = await fetchHiveStatus("demo-hive");
  console.log("HoneyWellBees status:", status);
}

main();
