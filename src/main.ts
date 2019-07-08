import "reflect-metadata";
import { config } from "dotenv";
config();
import { Connection } from "typeorm";
import express from "express";
import { Express } from "express-serve-static-core";

import GraphQLHTTP from "express-graphql";
import GenerateSchema from "./graphql/GenerateSchema";

import create_connection from "./database/CreateConnection";

async function main(): Promise<void> {
  const server: Express = express();

  server.use(
    GraphQLHTTP({
      schema: GenerateSchema() as any,
      graphiql: (process.env.ENVIRONMENT as string) !== "PROD"
    })
  );

  const connection: Connection = await create_connection();
  console.log("conection successful:", !!connection);

  await server.listen(process.env.PORT || 3000);
  console.log(`Server running on port ${process.env.PORT || 3000}`);

  process.on("unhandledRejection", (error: any): void => console.error(error));
  process.on("uncaughtException", (error: any): void => console.error(error));
}
main();
