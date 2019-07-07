import { createConnection, Connection, getConnectionOptions } from "typeorm";

export default async (): Promise<Connection> => {
  const env: string = process.env.ENVIRONMENT as string;
  console.log("env", env);
  if (env === "DEV") {
    return await createConnection(await getConnectionOptions("dev"));
  }

  if (env === "TEST") {
    return await createConnection(await getConnectionOptions("test"));
  }

  if (env === "PROD") {
    return await createConnection({
      type: "mongodb",
      useNewUrlParser: true,
      url: process.env.MONGODB_URL,
      database: "steakroastdev"
    });
  }

  return {} as Connection;
};
