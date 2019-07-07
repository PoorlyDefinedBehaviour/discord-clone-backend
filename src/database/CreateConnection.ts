import { createConnection, Connection } from "typeorm";

export default async (): Promise<Connection> =>
  (process.env.ENVIRONMENT as string) === "DEV"
    ? await createConnection({
        type: "mongodb",
        useNewUrlParser: true,
        host: "localhost",
        port: 27017,
        database: "steakroastdev"
      })
    : await createConnection({
        type: "mongodb",
        useNewUrlParser: true,
        url: process.env.MONGODB_URL,
        database: "steakroastdev"
      });
