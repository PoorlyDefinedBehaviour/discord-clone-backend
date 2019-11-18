import load from "process-env-loader";
load();
import express from "express";
import { Express } from "express-serve-static-core";
import cors from "cors";
import morgan from "morgan";
import rate_limiter from "./config/RateLimiter";
import global_exception_handler from "./http/middlewares/GlobalExceptionHandler.middleware";
import token_validator from "./http/middlewares/TokenRequired.middleware";
// @ts-ignore
import Mongoose from "./database/MongoDB";
import graphql_http from "./config/GraphQLHttp";

async function main(): Promise<void> {
  const app: Express = express();

  const server = require("http").Server(app);
  const io = require("socket.io").listen(server, { secure: false });

  app.disable("X-Powered-By");
  app.use(morgan("combined"));
  app.use(cors());
  app.use(express.json());
  app.use(rate_limiter);
  app.use(token_validator);
  app.use(graphql_http);
  app.use(global_exception_handler);

  io.on("connection", (socket: any): void => {
    console.log(`${socket.id} connected`);

    socket.on("join", (room: string): void => socket.join(room));

    socket.on("message", (data: any): void =>
      socket.to(data.message.room).emit("message", { message: data.message })
    );

    socket.on("voice", (data: any): void =>
      socket.to(data.data.room).emit("voice", data)
    );
  });

  server
    .listen(process.env.PORT!, process.env.HOST || "0.0.0.0")
    .on("error", console.error);

  console.log(`Listening on PORT ${process.env.PORT}`);

  process.on("unhandledRejection", console.error);
  process.on("uncaughtException", console.error);
}
main();
