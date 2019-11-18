import { Server } from "../../database/models/Server.model";
import { User } from "../../database/models/User.model";
import {
  UserNotFound,
  ServerNameInUse,
  TokenRequired,
  InvalidServerId,
  ServerNotFound,
  AlreadyAServerMember,
  NotAServerMember
} from "../errors";

export default {
  Query: {
    server: async (_, { _id }) => {
      if (!_id) {
        return { status: 400, errors: [InvalidServerId] };
      }

      const server: any = await Server.findOne({ _id }, User)
        .populate("owner")
        .populate("staff")
        .populate("members");

      if (!server) {
        return { status: 404, errors: [ServerNotFound] };
      }

      return { status: 200, server };
    },
    servers: async (_, { page = 0 }) => {
      return {
        status: 200,
        servers: await Server.find({})
          .populate("members")
          .populate("owner")
          .skip((page as number) * 20)
          .limit(20)
      };
    }
  },
  Mutation: {
    create_server: async (_, { name }, { token_payload: { _id } }) => {
      if (!_id) {
        return { status: 401, errors: [TokenRequired] };
      }

      const user = await User.findOne({ _id }, Server);
      if (!user) {
        return { status: 401, errors: [UserNotFound] };
      }

      if (await Server.findOne({ name }, User)) {
        return { status: 400, errors: [ServerNameInUse] };
      }

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
    },
    join_server: async (_, { _id }, { token_payload: { _id: user_id } }) => {
      if (!user_id) {
        return { status: 401, errors: [TokenRequired] };
      }

      const server = await Server.findOne({ _id }, User);
      if (!server) {
        return { stats: 404, errors: [ServerNotFound] };
      }

      const user = await User.findOne({ _id: user_id }, Server);
      if (!user) {
        return { status: 401, errors: [TokenRequired] };
      }

      if (server.members.includes(user._id as any)) {
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
    },
    leave_server: async (_, { _id }, { token_payload: { _id: user_id } }) => {
      if (!_id) {
        return { status: 401, errors: [TokenRequired] };
      }

      const server: any = await Server.findOne({ _id }, User);
      const user: any = await User.findOne({ _id: user_id }, Server);

      if (!server.members.includes(user_id)) {
        return { status: 409, errors: [NotAServerMember] };
      }

      server.members = server.members.filter((id: string) => id != user_id);

      user.servers = user.servers.filter((id: string) => id != _id);

      await server.save();
      await user.save();

      return {
        status: 201,
        server: await Server.findOne({ _id }, User)
          .populate("owner")
          .populate("staff")
          .populate("members")
      };
    }
  }
};
