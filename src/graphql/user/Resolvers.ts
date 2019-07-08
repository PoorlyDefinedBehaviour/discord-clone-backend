import User from "../../database/entity/User";
import create_connection from "../../database/CreateConnection";

export default {
  Query: {
    hello: (_: any, { name }: GQL.IHelloOnQueryArguments) =>
      `Hello ${name || "World"}`
  },
  Mutation: {
    register: async (
      _: any,
      { email, password }: GQL.IRegisterOnMutationArguments
    ) => {
      /*
      await User.create({
        email,
        password
      });
      */
      const user = new User();
      user.email = email;
      user.password = password;

      const connection = await create_connection();
      return await connection.mongoManager.save(user);
    }
  }
};
