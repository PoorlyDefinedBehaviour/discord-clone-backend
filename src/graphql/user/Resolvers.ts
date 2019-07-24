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
  InvalidCredentials,
  TokenRequired,
  AlreadyFriend,
  UsernameNotValid
} from "../errors";

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
      if (!_id) return { status: 422, errors: [InvalidUserId] };

      const user: Maybe<IUser> = await User.findOne({ _id }, Server)
        .select("-password")
        .catch((error: any): any => null);

      if (!user) return { status: 404, errors: [UserNotFound] };

      return {
        status: 200,
        user
      };
    },
    users: async (_: any, { page = 0 }: GQL.IUsersOnQueryArguments) => {
      try {
        const users: any = await User.find({}, Server)
          .skip((page as number) * 20)
          .limit(20)
          .populate("friends")
          .populate("friend_requests")
          .populate("servers");

        return {
          status: 200,
          page,
          users
        };
      } catch (e) {
        console.error("users", e);
        return { status: 500, errors: [InternalServerError] };
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

      const user_already_exists: boolean = !!(await User.findOne(
        { email },
        Server
      ));
      if (user_already_exists)
        return { status: 422, errors: [EmailAlreadyInUse] };

      const user: Maybe<IUser> = await User.create({
        username,
        email,
        password
      }).catch((error: any): any => null);

      if (!user) return { status: 500, errors: [InternalServerError] };

      delete user.password;

      return {
        status: 201,
        token: sign({ _id: user._id }, process.env.JWT_SECRET as string, {
          expiresIn: "24h"
        }),
        user
      };
    },
    login: async (_: any, { email, password }: any) => {
      try {
        let user: Maybe<IUser> = await User.findOne({ email }, Server)
          .populate("servers")
          .populate("friends")
          .populate("friend_requests")
          .select("password");

        if (!user) return { status: 401, errors: [InvalidCredentials] };

        if (!(await compare(password, user.password)))
          return { status: 401, errors: [InvalidCredentials] };

        delete user.password;

        if (!user.active) {
          user = await User.findOneAndUpdate(
            { _id: user._id },
            { active: true },
            {
              new: true
            }
          ).exec();
        }

        return {
          status: 200,
          token: sign(
            { _id: (user as any)._id },
            process.env.JWT_SECRET as string,
            {
              expiresIn: "24h"
            }
          ),
          user
        };
      } catch (error) {
        console.error(error);
        return { status: 500, errors: [InternalServerError] };
      }
    },
    send_friend_request: async (
      _: any,
      { _id }: any,
      { token_payload: { _id: user_id } }: any
    ) => {
      if (!_id) return { status: 422, errors: [InvalidUserId] };

      if (!user_id) return { status: 401, errors: [TokenRequired] };

      const friend: any = await User.findOne({ _id }, Server).catch(
        (error: any) => null
      );

      if (!friend) return { status: 404, errors: [UserNotFound] };

      if (!friend.friend_requests.includes(user_id)) {
        friend.friend_requests.push(user_id);
        await friend.save();
      }

      return { status: 200 };
    },
    accept_friend_request: async (
      _: any,
      { _id }: any,
      { token_payload: { _id: user_id } }: any
    ) => {
      if (!_id) return { status: 422, errors: [InvalidUserId] };

      if (!user_id) return { status: 401, errors: [TokenRequired] };

      const user: Maybe<IUser> = await User.findOne(
        { _id: user_id },
        Server
      ).catch((error: any) => null);

      if (!user) return { status: 404, errors: [UserNotFound] };

      const friend: Maybe<IUser> = await User.findOne({ _id }, Server).catch(
        (error: any) => null
      );

      if (!friend) return { status: 404, errors: [UserNotFound] };

      const already_friend: boolean = !!(user as IUser).friends.find(
        (u: any) => u._id == _id
      );

      if (already_friend) return { status: 409, errors: [AlreadyFriend] };

      return {
        status: 200,
        user: await (user as IUser)
          .populate("friends friend_requests servers")
          .save()
      };
    },
    change_username: async (
      _: any,
      { username }: any,
      { token_payload: { _id } }: any
    ) => {
      if (!_id) return { status: 401, errors: [InvalidUserId] };

      if (username.split("").length < 5) {
        return { status: 422, errors: [UsernameNotValid] };
      }

      try {
        const user: any = await User.findOne({ _id }, Server).catch(
          (error: any) => null
        );

        user.username = username;

        await user.save();

        return { status: 201, user };
      } catch (e) {
        return { status: 500, errors: [UserNotFound, InternalServerError] };
      }
    },
    delete_account: async (
      _: any,
      __: any,
      { token_payload: { _id } }: any
    ) => {
      if (!_id) return { status: 401, errors: [TokenRequired] };

      try {
        const user: any = await User.findOneAndDelete({ _id });

        return { status: 201, user };
      } catch (e) {
        return { status: 500, errors: [UserNotFound, InternalServerError] };
      }
    },
    deactivate_account: async (
      _: any,
      __: any,
      { token_payload: { _id } }: any
    ) => {
      if (!_id) return { status: 401, errors: [TokenRequired] };

      try {
        const user: any = await User.findOneAndUpdate(
          { _id },
          { active: false },
          {
            new: true
          }
        ).exec();

        return { status: 201, user };
      } catch (e) {
        return { status: 500, errors: [UserNotFound, InternalServerError] };
      }
    },
    update_account: async (
      _: any,
      { username, email, password }: any,
      { token_payload: { _id } }: any
    ) => {
      if (!_id) return { status: 401, errors: [TokenRequired] };

      let update: any = {};

      if (username) {
        update.username = username;
      }
      if (email) {
        update.email = email;
      }
      if (password) {
        update.password = password;
      }

      try {
        const user: any = await User.findOneAndUpdate({ _id }, update, {
          new: true
        }).exec();

        return { status: 201, user };
      } catch (e) {
        return { status: 500, errors: [UserNotFound, InternalServerError] };
      }
    },
  }
};
