import * as yup from "yup";
import { FormatYupError } from "../../utils/FormatYupError";
import User from "../../database/entity/User";
import create_connection from "../../database/CreateConnectionIfNotConnected";
import { Maybe } from "../../types/maybe";
import { Connection } from "typeorm";
import { ObjectID } from "mongodb";

import {
  InternalServerError,
  EmailAlreadyInUse,
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
        return {
          status: 422,
          errors: [InvalidUserId]
        };
      }

      const connection: Maybe<Connection> = await create_connection();

      if (!connection) {
        return {
          status: 500,
          errors: [InternalServerError]
        };
      }

      const user: Maybe<User> = await connection.mongoManager
        .findOne(User, {
          _id: new ObjectID(_id)
        })
        .catch((error: any) => null);

      console.log("user", user);
      if (!user) {
        return {
          status: 404,
          errors: [UserNotFound]
        };
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
          return {
            status: 500,
            errors: [InternalServerError]
          };
        }

        if (await connection.mongoManager.findOne(User, { email })) {
          return { status: 422, errors: [EmailAlreadyInUse] };
        }

        const user: any = await connection.mongoManager.save(
          new User(email, password)
        );
        return { status: 201, user };
      } catch (error) {
        console.error(error);
        return { status: 500, errors: [InternalServerError] };
      }
    }
  }
};
