import * as hapi from "hapi";

async function main(): Promise<void> {
  const server: hapi.Server = new hapi.Server({
    port: process.env.PORT || 3000,
    host: process.env.HOST || "localhost"
  });

  await server.start();
  console.log(`Server running on port ${process.env.port || 3000}`);

  process.on("unhandledRejection", (error: any): void => console.error(error));
  process.on("uncaughtException", (error: any): void => console.error(error));
}
main();
