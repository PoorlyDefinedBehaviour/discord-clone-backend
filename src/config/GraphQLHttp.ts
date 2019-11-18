import GraphQLHTTP from "express-graphql";
import generate_schema from "../graphql/GenerateSchema";

const graphql_http = GraphQLHTTP({
  schema: generate_schema() as any,
  graphiql: !/prod/i.test(process.env.NODE_ENV as string)
});

export default graphql_http;
