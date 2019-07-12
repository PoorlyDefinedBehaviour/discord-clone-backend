import Mongoose from "mongoose";
import MongoosePaginate from "mongoose-paginate";

Mongoose.plugin(MongoosePaginate);

Mongoose.set("useCreateIndex", true);

const connect = async (): Promise<void> => {
  const env: string = process.env.ENVIRONMENT as string;

  console.log(`ENVIRONMENT=${env}`);

  if (/dev/gi.test(env)) {
    await Mongoose.connect("mongodb://localhost/discord-backend-dev", {
      useCreateIndex: true,
      useNewUrlParser: true,
      keepAlive: true,
      keepAliveInitialDelay: 30000
    });
  }

  if (/test/gi.test(env)) {
    await Mongoose.connect("mongodb://localhost/discord-backend-test", {
      useCreateIndex: true,
      useNewUrlParser: true,
      keepAlive: true,
      keepAliveInitialDelay: 30000
    });
  }

  if (/prod/gi.test(env)) {
    await Mongoose.connect(process.env.MONGODB_URL as string, {
      useCreateIndex: true,
      useNewUrlParser: true,
      keepAlive: true,
      keepAliveInitialDelay: 30000
    });
  }
};
connect();

export default Mongoose;
