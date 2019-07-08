import { mergeTypes, mergeResolvers } from "merge-graphql-schemas";
import { makeExecutableSchema } from "graphql-tools";
import { importSchema } from "graphql-import";
import { sync } from "glob";

export default () => {
  const types: any = sync(`${__dirname}/**/*.graphql`).map((file: string) =>
    importSchema(file)
  );

  const resolvers = sync(`${__dirname}/**/*.?s`)
    .filter((file: string) => !/GenerateSchema/gi.test(file))
    .map((file: string) => require(file).default);

  return makeExecutableSchema({
    typeDefs: mergeTypes(types),
    resolvers: mergeResolvers(resolvers)
  });
};
