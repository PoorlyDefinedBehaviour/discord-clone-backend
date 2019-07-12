import axios, { AxiosResponse } from "axios";
import faker from "faker";
import GraphQLEndPoint from "../GraphQLEndPoint";

import { register_user } from "../user/User.test";

describe("server test suite", () => {
  beforeAll(async () => {
    faker.seed(Date.now());

    const {
      data: {
        register: { token }
      }
    }: AxiosResponse<any> = await register_user(
      faker.internet.userName(),
      faker.internet.email(),
      faker.internet.password()
    );
    axios.defaults.headers.post["authorization"] = `Bearer ${token}`;
  });

  test("create a server", async () => {
    const {
      data: {
        data: {
          create_server: { status }
        }
      }
    }: AxiosResponse<any> = await axios.post(GraphQLEndPoint, {
      query: `
      mutation {
        create_server(name: "${faker.internet.userName() + Date.now()}") {
          status
          server {
            _id
          }
        }
      }
      `
    });

    expect(status).toBe(201);
  });

  test("query by id", async () => {
    const {
      data: {
        data: {
          create_server: {
            server: { _id }
          }
        }
      }
    }: AxiosResponse<any> = await axios.post(GraphQLEndPoint, {
      query: `
      mutation {
        create_server(name: "${faker.internet.userName() + Date.now()}") {
          status
          server {
            _id
          }
        }
      }
      `
    });

    const {
      data: {
        data: {
          server: { server }
        }
      }
    }: AxiosResponse<any> = await axios.post(GraphQLEndPoint, {
      query: `
      {
        server(_id: "${_id}") {
          status
          errors {
            path
            message
          }
          server {
            _id
            name
            owner {
              _id
              username
              email
              avatar
            }
            logo
            staff {
              _id
              username
              email
              avatar
            }
            
          }
        }
      }
      `
    });

    expect(_id as string).toEqual(server._id as string);
  });
});
