import "reflect-metadata";
import { config } from "dotenv";
config();
import { Connection } from "typeorm";

import express from "express";
import { Express } from "express-serve-static-core";
import cors from "cors";

import GraphQLHTTP from "express-graphql";
import GenerateSchema from "./graphql/GenerateSchema";

import db_connection from "./database/CreateConnectionIfNotConnected";
import { Maybe } from "./types/maybe";

async function main(): Promise<void> {
  const app: Express = express();

  app.use(express.json());
  app.use(cors());

  app.use(
    GraphQLHTTP({
      schema: GenerateSchema() as any,
      graphiql: (process.env.ENVIRONMENT as string) !== "PROD"
    })
  );

  // @ts-ignore
  const server: any = await app.listen(process.env.PORT || 3000);
  console.log(`Server running on port ${process.env.PORT || 3000}`);

  const connection: Maybe<Connection> = await db_connection();
  console.log("conection successful:", !!connection);

  process.on("unhandledRejection", (error: any): void => console.error(error));
  process.on("uncaughtException", (error: any): void => console.error(error));
}
main();
