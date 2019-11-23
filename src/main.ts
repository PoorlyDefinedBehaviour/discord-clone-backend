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
import http from "http";
import socketio from "socket.io";
import Chat from "./chat/Chat";
import User from "./chat/User";

async function main(): Promise<void> {
  const app: Express = express();

  //const server = require("http").Server(app);
  const server = http.createServer(app);
  const io = socketio.listen(server);

  app.disable("X-Powered-By");
  app.use(morgan("combined"));
  app.use(cors());
  app.use(express.json());
  app.use(rate_limiter);
  app.use(token_validator);
  app.use(graphql_http);
  app.use(global_exception_handler);

  const chat = new Chat();

  io.on("connection", (socket) => {
    console.log(`${socket.id} connected`);

    socket.on("join", (data) => {
      chat.subscribe(data.server_id, new User(chat, socket, data));
    });
  });

  await server.listen(process.env.PORT!);

  console.log(`Listening on PORT ${process.env.PORT}`);

  process.on("unhandledRejection", console.error);
  process.on("uncaughtException", console.error);
}
main();
