import { createConnection, Connection } from "typeorm";

export default async (): Promise<Connection> => {
  const connection: Connection = await createConnection({
    type: "mongodb",
    useNewUrlParser: true,
    url: process.env.MONGODB_URL,
    database: "steakroastdev"
  });

  return connection;
};
