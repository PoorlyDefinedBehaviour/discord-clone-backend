import * as yup from "yup";
import { FormatYupError } from "../../utils/FormatYupError";
import User from "../../database/entity/User";
import create_connection from "../../database/CreateConnection";

const RegisterSchema = yup.object().shape({
  email: yup
    .string()
    .min(5, "Email must be at least 5 characters long")
    .max(255)
    .email("Email must be a valid email"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(255)
});

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
      try {
        await RegisterSchema.validate(
          { email, password },
          { abortEarly: false }
        );
      } catch (error) {
        return FormatYupError(error);
      }

      try {
        const connection = await create_connection();

        if (!!(await connection.mongoManager.findOne(User, { email }))) {
          return [
            {
              status: 422,
              path: "email",
              message: "Email already in use"
            }
          ];
        }

        await connection.mongoManager.save(new User(email, password));
        return [{ status: 201, message: "User created" }];
      } catch (error) {
        console.error(error);
        return [
          {
            status: 500,
            path: null,
            error: "Something went wrong trying to create a new user"
          }
        ];
      }
    }
  }
};
