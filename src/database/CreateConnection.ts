import { createConnection, Connection, getConnectionOptions } from "typeorm";
import Maybe from "graphql/tsutils/Maybe";

let connection: Maybe<Connection> = null;

export default async (): Promise<Maybe<Connection>> => {
  const env: string = process.env.ENVIRONMENT as string;

  if (connection) {
    return connection;
  }

  console.log(`Creating ${env} connection...`);

  if (/dev/gi.test(env)) {
    connection = await createConnection(await getConnectionOptions("dev"));
  }

  if (/test/gi.test(env)) {
    connection = await createConnection(await getConnectionOptions("test"));
  }

  if (/prod/gi.test(env)) {
    connection = await createConnection({
      type: "mongodb",
      useNewUrlParser: true,
      url: process.env.MONGODB_URL,
      database: "steakroastdev",
      synchronize: false
    });
  }

  return connection;
};
