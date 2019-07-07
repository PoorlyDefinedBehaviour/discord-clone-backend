import "reflect-metadata";
import { config } from "dotenv";
config();
import { Connection } from "typeorm";
import express from "express";
import { Express } from "express-serve-static-core";

import GraphQLHTTP from "express-graphql";
import UserTest from "./graphql/schemas/UserTest";

import create_connection from "./database/CreateConnection";

async function main(): Promise<void> {
  const server: Express = express();

  server.use(
    "/graphql",
    GraphQLHTTP({
      schema: UserTest,
      graphiql: (process.env.ENVIRONMENT as string) !== "PROD"
    })
  );

  await server.listen(process.env.PORT || 3000);
  console.log(`Server running on port ${process.env.PORT || 3000}`);

  server.get(
    "/",
    (_: express.Request, response: express.Response): express.Response =>
      response.send("Hello world")
  );

  const connection: Connection = await create_connection();
  console.log("conection successful:", !!connection);

  process.on("unhandledRejection", (error: any): void => console.error(error));
  process.on("uncaughtException", (error: any): void => console.error(error));
}
main();
