import "reflect-metadata";
import { config } from "dotenv";
config();
import express from "express";
import { Express } from "express-serve-static-core";

import create_connection from "./database/CreateConnection";

async function main(): Promise<void> {
  const server: Express = express();

  await server.listen(process.env.PORT || 3000);
  console.log(`Server running on port ${process.env.PORT || 3000}`);

  server.get(
    "/",
    (_: express.Request, response: express.Response): express.Response =>
      response.send("Hello world")
  );

  console.log(await create_connection());

  process.on("unhandledRejection", (error: any): void => console.error(error));
  process.on("uncaughtException", (error: any): void => console.error(error));
}
main();
