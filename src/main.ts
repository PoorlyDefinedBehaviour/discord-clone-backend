import express from "express";
import { config } from "dotenv";
config();

async function main(): Promise<void> {
  const server: any = express();

  await server.listen(process.env.PORT || 3000);
  console.log(`Server running on port ${process.env.PORT || 3000}`);

  process.on("unhandledRejection", (error: any): void => console.error(error));
  process.on("uncaughtException", (error: any): void => console.error(error));
}
main();
