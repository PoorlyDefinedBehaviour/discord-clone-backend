import * as yup from "yup";
import { FormatYupError } from "../../utils/FormatYupError";
import User from "../../database/entity/User";
import create_connection from "../../database/CreateConnection";
import { Maybe } from "../../types/maybe";
import { Connection } from "typeorm";
import { ObjectID } from "mongodb";

import {
  InternalServerError,
  EmailAlreadyInUse,
  UserCreated,
  InvalidUserId,
  UserNotFound
} from "../responses";

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
    user: async (_: any, { _id }: any) => {
      if (!_id) {
        return InvalidUserId;
      }

      const connection: Maybe<Connection> = await create_connection();

      if (!connection) {
        return InternalServerError;
      }

      const user: Maybe<User> = await connection.mongoManager
        .findOne(User, {
          _id: new ObjectID(_id)
        })
        .catch((error: any) => null);

      console.log("user", user);
      if (!user) {
        return UserNotFound;
      }

      delete user.password;

      return { status: 200, user };
    }
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
        const connection: Maybe<Connection> = await create_connection();

        if (!connection) {
          return [InternalServerError];
        }

        if (await connection.mongoManager.findOne(User, { email })) {
          return [EmailAlreadyInUse];
        }

        await connection.mongoManager.save(new User(email, password));
        return [UserCreated];
      } catch (error) {
        console.error(error);
        return [InternalServerError];
      }
    }
  }
};
