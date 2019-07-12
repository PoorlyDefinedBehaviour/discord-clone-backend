import load from "process-env-loader";
load();

import express from "express";
import { Express } from "express-serve-static-core";
import ExpressRateLimit from "express-rate-limit";
import cors from "cors";

import { TokenValidator } from "./http/middlewares/Auth";

import GraphQLHTTP from "express-graphql";
import GenerateSchema from "./graphql/GenerateSchema";

// @ts-ignore
import Mongoose from "./database/MongoDB";

async function main(): Promise<void> {
  const app: Express = express();

  app.use(express.json());
  app.use(cors());
  app.use(TokenValidator);

  app.use(
    new ExpressRateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 100 // limit each IP to 100 requests per windowMs
    })
  );

  app.use(
    GraphQLHTTP({
      schema: GenerateSchema() as any,
      graphiql: (process.env.ENVIRONMENT as string) !== "PROD"
    })
  );

  // @ts-ignore
  const server: express.Server = await app.listen(
    ((process.env.PORT as any) as number) || 3000
  );
  console.log(`Server running on port ${process.env.PORT || 3000}`);

  process.on("unhandledRejection", (error: any): void => console.error(error));
  process.on("uncaughtException", (error: any): void => console.error(error));
}
main();
