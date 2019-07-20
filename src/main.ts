import load from "process-env-loader";
load();

import express from "express";
import { Express } from "express-serve-static-core";

import { TokenValidator } from "./http/middlewares/Auth";

import GraphQLHTTP from "express-graphql";
import GenerateSchema from "./graphql/GenerateSchema";

// @ts-ignore
import Mongoose from "./database/MongoDB";
import { Maybe } from "./types/maybe";

import RateLimit from "express-rate-limit";
import Cors from "./http/middlewares/Cors";

export let server: Maybe<any>;

const app: Express = express();
server = require("http").Server(app);
const io: any = require("socket.io").listen(server, { secure: false });

async function main(): Promise<void> {
  app.use(express.json());
  app.use(TokenValidator);
  app.use(Cors);

  app.use(
    new RateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000 // limit each IP to 100 requests per windowMs
    })
  );

  app.use(
    GraphQLHTTP({
      schema: GenerateSchema() as any,
      graphiql: (process.env.ENVIRONMENT as string) !== "PROD"
    })
  );

  io.on(
    "connection",
    (socket: any): void => {
      console.log(`${socket.id} connected`);
      socket.emit("test", "testdata");

      socket.on("join", (room: string): void => socket.join(room));

      socket.on(
        "message",
        (data: any): void => {

          socket
            .to(data.message.room)
            .emit("message", { message: data.message });
        }
      );

      socket.on(
        "disconnect",
        (): void => {
          console.log("Client disconnected.");
        }
      );
    }
  );

  server
    .listen(
      (process.env.PORT as any) as number,
      process.env.HOST || "0.0.0.0",
      () => console.log(` Listening on PORT ${process.env.PORT}`)
    )
    .on("error", (error: any): void => console.log(error));

  process.on("unhandledRejection", (error: any): void => console.error(error));
  process.on("uncaughtException", (error: any): void => console.error(error));
}
main();
