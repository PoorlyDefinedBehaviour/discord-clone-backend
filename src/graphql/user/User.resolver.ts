import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { Server } from "../../database/models/Server.model";
import { IUser, User } from "../../database/models/User.model";
import {
  EmailAlreadyInUse,
  InvalidUserId,
  UserNotFound,
  InvalidCredentials,
  TokenRequired,
  AlreadyFriend,
  UsernameNotValid
} from "../errors";
import Maybe from "../../types/maybe";
import register_schema from "../../validation/schemas/Register.schema";
import yup_validate from "../../utils/YupValidate";

export default {
  Query: {
    user: async (_, { _id }) => {
      if (!_id) return { status: 422, errors: [InvalidUserId] };

      const user: Maybe<IUser> = await User.findOne({ _id }, Server)
        .select("-password")
        .catch((error: Error) => null);

      if (!user) return { status: 404, errors: [UserNotFound] };

      return {
        status: 200,
        user
      };
    },
    users: async (_, { page = 0 }) => {
      const users = await User.find({}, Server)
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
    }
  },
  Mutation: {
    register: async (_, { username, email, password }) => {
      const errors = await yup_validate(register_schema, {
        username,
        email,
        password
      });
      if (errors) {
        return { status: 422, errors };
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
      });

      delete user.password;

      return {
        status: 201,
        token: sign({ _id: user._id }, process.env.JWT_SECRET as string, {
          expiresIn: "24h"
        }),
        user
      };
    },
    login: async (_, { email, password }) => {
      let user: Maybe<IUser> = await User.findOne({ email }, Server)
        .populate("servers")
        .populate("friends")
        .populate("friend_requests")
        .select("password");

      if (!user) {
        return { status: 401, errors: [InvalidCredentials] };
      }

      if (!(await compare(password, user.password))) {
        return { status: 401, errors: [InvalidCredentials] };
      }

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
    },
    send_friend_request: async (
      _,
      { _id },
      { token_payload: { _id: user_id } }
    ) => {
      if (!_id) {
        return { status: 422, errors: [InvalidUserId] };
      }
      if (!user_id) {
        return { status: 401, errors: [TokenRequired] };
      }

      const friend = await User.findOne({ _id }, Server);
      if (!friend) {
        return { status: 404, errors: [UserNotFound] };
      }

      if (!friend.friend_requests.includes(user_id)) {
        friend.friend_requests.push(user_id);
        await friend.save();
      }

      return { status: 200 };
    },
    accept_friend_request: async (
      _,
      { _id },
      { token_payload: { _id: user_id } }
    ) => {
      if (!_id) {
        return { status: 422, errors: [InvalidUserId] };
      }
      if (!user_id) {
        return { status: 401, errors: [TokenRequired] };
      }

      const user: Maybe<IUser> = await User.findOne({ _id: user_id }, Server);
      if (!user) {
        return { status: 404, errors: [UserNotFound] };
      }

      const friend: Maybe<IUser> = await User.findOne({ _id }, Server);
      if (!friend) {
        return { status: 404, errors: [UserNotFound] };
      }

      const already_friend: boolean = !!(user as IUser).friends.find(
        (u: any) => u._id == _id
      );

      if (already_friend) {
        return { status: 409, errors: [AlreadyFriend] };
      }

      const updated_user = await user
        .populate("friends friend_requests servers")
        .save();

      return {
        status: 200,
        user: updated_user
      };
    },
    change_username: async (_, { username }, { token_payload: { _id } }) => {
      if (!_id) {
        return { status: 401, errors: [InvalidUserId] };
      }

      if (username.split("").length < 5) {
        return { status: 422, errors: [UsernameNotValid] };
      }

      const user = await User.findOne({ _id }, Server);
      if (!user) {
        return { status: 404, errors: [UserNotFound] };
      }

      user.username = username;

      await user.save();

      return { status: 201, user };
    },
    delete_account: async (_, __, { token_payload: { _id } }) => {
      if (!_id) {
        return { status: 401, errors: [TokenRequired] };
      }

      const user = await User.findOneAndDelete({ _id });

      return { status: 201, user };
    },
    deactivate_account: async (_, __, { token_payload: { _id } }) => {
      if (!_id) {
        return { status: 401, errors: [TokenRequired] };
      }

      const user = await User.findOneAndUpdate(
        { _id },
        { active: false },
        {
          new: true
        }
      ).exec();

      return { status: 201, user };
    },
    update_account: async (
      _,
      { username, email, password },
      { token_payload: { _id } }
    ) => {
      if (!_id) return { status: 401, errors: [TokenRequired] };

      let update: { username?: string; email?: string; password?: string } = {};

      if (username) {
        update.username = username;
      }
      if (email) {
        update.email = email;
      }
      if (password) {
        update.password = password;
      }

      const user = await User.findOneAndUpdate({ _id }, update, {
        new: true
      }).exec();

      return { status: 201, user };
    }
  }
};
