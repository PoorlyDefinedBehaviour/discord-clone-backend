import Mongoose from "./database/MongoDB";
import { server } from "./main";

export default async (): Promise<void> => {
  if (/test/i.test(process.env.NODE_ENV as string)) {
    await Mongoose.connection.dropDatabase();
    if (server) await server.close();
  }
};
