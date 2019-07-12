import * as yup from "yup";
import { FormatYupError } from "../../utils/FormatYupError";
import { Maybe } from "../../types/maybe";

import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";

import { Server } from "../../database/models/Server";
import { IUser, User } from "../../database/models/User";

import {
  InternalServerError,
  EmailAlreadyInUse,
  InvalidUserId,
  UserNotFound,
  InvalidCredentials
} from "../responses";

const RegisterSchema = yup.object().shape({
  username: yup
    .string()
    .min(5, "Username must be at least 5 characters long")
    .max(255),
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

      try {
        const user = await User.findOne({ _id }, Server).select("-password");

        if (!user) return { status: 404, errors: [UserNotFound] };

        return {
          status: 200,
          user
        };
      } catch (error) {
        return {
          status: 400,
          errors: [
            {
              path: null,
              message: "User not found"
            }
          ]
        };
      }
    },
    users: async (_: any, { page = 0 }: GQL.IUsersOnQueryArguments) => {
      try {
        const { docs: users }: Maybe<any> = await (User as any).paginate(
          {},
          {
            page,
            limit: -20
          }
        );

        if (!users) return { status: 404, errors: [UserNotFound], page };

        return { status: 200, users, page };
      } catch (error) {
        console.error(error);
        return {
          status: 500,
          errors: [InternalServerError],
          page
        };
      }
    }
  },
  Mutation: {
    register: async (
      _: any,
      { username, email, password }: GQL.IRegisterOnMutationArguments
    ) => {
      try {
        await RegisterSchema.validate(
          { username, email, password },
          { abortEarly: false }
        );
      } catch (error) {
        return { status: 422, errors: FormatYupError(error) };
      }

      try {
        if (await User.findOne({ email }, Server)) {
          return { status: 422, errors: [EmailAlreadyInUse] };
        }

        const user: IUser = await User.create({ username, email, password });

        delete user.password;

        return {
          status: 201,
          token: sign({ _id: user._id }, process.env.JWT_SECRET as string, {
            expiresIn: "24h"
          }),
          user
        };
      } catch (error) {
        console.error(error);
        return { status: 500, errors: [InternalServerError] };
      }
    },
    login: async (_: any, { email, password }: any) => {
      try {
        const user: Maybe<IUser> = await User.findOne({ email }, Server).select(
          "password"
        );

        if (!user) return { status: 401, errors: [InvalidCredentials] };

        if (!(await compare(password, user.password)))
          return { status: 401, errors: [InvalidCredentials] };

        delete user.password;

        return {
          status: 200,
          token: sign({ _id: user._id }, process.env.JWT_SECRET as string, {
            expiresIn: "24h"
          }),
          user
        };
      } catch (error) {
        console.error(error);
        return { status: 500, errors: [InternalServerError] };
      }
    }
  }
};
