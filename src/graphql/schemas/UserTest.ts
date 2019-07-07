import { makeExecutableSchema } from "graphql-tools";

const typeDefs: string = `
type UserTest {
  id: Int!
  name: String!
}

type Query {
  users: [UserTest]
}
`;

const resolvers: any = {
  Query: {
    users: () => [{ id: 1, name: "test" }, { id: 2, name: "test2" }]
  }
};

export default makeExecutableSchema({
  typeDefs,
  resolvers
});
