import { Server, IServer } from "../../database/models/Server";
import { IUser, User } from "../../database/models/User";

import {
  InternalServerError,
  UserNotFound,
  FailedToCreateServer,
  ServerNameInUse,
  TokenRequired,
  InvalidServerId,
  ServerNotFound
} from "../errors";

import pipe from "../../utils/Pipe";
import Mongoose from "../../database/MongoDB";
import { Maybe } from "../../types/maybe";

export default {
  Query: {
    server: async (_: any, { _id }: any) => {
      if (!_id) return { status: 400, errors: [InvalidServerId] };

      const server: Maybe<IServer> = await Server.findOne({ _id })
        .populate("staff owner members")
        .catch((error: any) => null);

      if (!server) return { status: 404, errors: [ServerNotFound] };

      return { status: 200, server };
    },
    servers: async (_: any, { page = 0 }: any) => {
      try {
        const { docs: servers }: Maybe<any> = await (Server as any)
          .paginate(
            {},
            {
              page,
              limit: -20
            }
          )
          .catch((error: any) => null);

        if (!servers) return { status: 404, errors: [ServerNotFound] };

        return { status: 200, page, servers };
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

        const user: Maybe<IUser> = await User.findOne({ _id }, Server);

        if (!user) return { status: 401, errors: [UserNotFound] };

        if (await Server.findOne({ name }, Server))
          return { status: 400, errors: [ServerNameInUse] };

        const server: IServer = await pipe(
          (doc: IServer): IServer => {
            doc.members.push(_id);
            doc.staff.push(_id);
            return doc;
          },
          async (doc: Mongoose.Document): Promise<Mongoose.Document> =>
            await doc.populate("owner staff").execPopulate()
        )(await Server.create({ name, owner: _id }));

        if (!server)
          return {
            status: 500,
            errors: [InternalServerError, FailedToCreateServer]
          };

        user.servers.push(server._id);

        return { status: 201, server };
      } catch (error) {
        console.error(error);
        return { status: 500, errors: [InternalServerError] };
      }
    }
  }
};
