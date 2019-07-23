import { Server } from "../../database/models/Server";
import { User } from "../../database/models/User";

import {
  InternalServerError,
  UserNotFound,
  FailedToCreateServer,
  ServerNameInUse,
  TokenRequired,
  InvalidServerId,
  ServerNotFound,
  AlreadyAServerMember,
  NotAServerMember
} from "../errors";

export default {
  Query: {
    server: async (_: any, { _id }: any) => {
      if (!_id) return { status: 400, errors: [InvalidServerId] };

      try {
        const server: any = await Server.findOne({ _id }, User)
          .populate("owner")
          .populate("staff")
          .populate("members");

        if (!server) {
          return { status: 404, errors: [ServerNotFound] };
        }

        return { status: 200, server };
      } catch (e) {
        console.error("server", e);
        return { status: 404, errors: [ServerNotFound] };
      }
    },
    servers: async (_: any, { page = 0 }: any) => {
      try {
        return {
          status: 200,
          servers: await Server.find({})
            .populate("members")
            .populate("owner")
            .skip(page * 20)
            .limit(20)
        };
      } catch (error) {
        console.error(error);
        return { status: 500, errors: [InternalServerError] };
      }
    }
  },
  Mutation: {
    create_server: async (
      _: any,
      { name }: any,
      { token_payload: { _id } }: any
    ) => {
      try {
        if (!_id) return { status: 401, errors: [TokenRequired] };

        const user: any = await User.findOne({ _id }, Server);

        if (!user) return { status: 401, errors: [UserNotFound] };

        if (await Server.findOne({ name }, User))
          return { status: 400, errors: [ServerNameInUse] };

        let server: any = await Server.create({ name, owner: _id });

        server.members.push(_id);
        server.staff.push(_id);

        await server.save();

        user.servers.push(server._id);

        await user.save();

        server = await Server.findOne({ _id: server._id }).populate({
          path: "owner",
          select: "-servers"
        });

        return { status: 201, server };
      } catch (error) {
        console.error(error);
        return {
          status: 500,
          errors: [InternalServerError, FailedToCreateServer]
        };
      }
    },
    join_server: async (
      _: any,
      { _id }: any,
      { token_payload: { _id: user_id } }: any
    ) => {
      try {
        if (!user_id) return { status: 401, errors: [TokenRequired] };

        const server: any = await Server.findOne({ _id }, User);
        const user: any = await User.findOne({ _id: user_id }, Server);

        if (server.members.includes(user._id)) {
          return { status: 409, errors: [AlreadyAServerMember] };
        }

        server.members.push(user_id);
        user.servers.push(_id);

        await server.save();
        await user.save();

        return {
          status: 201,
          server: await Server.findOne({ _id }, User)
            .populate("owner")
            .populate("staff")
            .populate("members")
        };
      } catch (e) {
        console.error(e);
        return { status: 500, errors: [ServerNotFound, InternalServerError] };
      }
    },
    leave_server: async (
      _: any,
      { _id }: any,
      { token_payload: { _id: user_id } }: any
    ) => {
      try {
        if (!_id) return { status: 401, errors: [TokenRequired] };

        const server: any = await Server.findOne({ _id }, User);
        const user: any = await User.findOne({ _id: user_id }, Server);

        if (!server.members.includes(user_id)) {
          return { status: 409, errors: [NotAServerMember] };
        }

        server.members = server.members.filter(
          (id: string): boolean => id != user_id
        );

        user.servers = user.servers.filter((id: string): boolean => id != _id);

        await server.save();
        await user.save();

        return {
          status: 201,
          server: await Server.findOne({ _id }, User)
            .populate("owner")
            .populate("staff")
            .populate("members")
        };
      } catch (e) {
        console.error(e);
        return { status: 500, errors: [ServerNotFound, InternalServerError] };
      }
    }
  }
};
