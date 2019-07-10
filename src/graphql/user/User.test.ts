import axios, { AxiosResponse } from "axios";
import faker from "faker";
import GraphQLEndPoint from "../GraphQLEndPoint";

describe("user test suite", () => {
  test("register a user", async () => {
    const {
      data: {
        data: {
          register: { status }
        }
      }
    }: AxiosResponse<any> = await axios.post(GraphQLEndPoint, {
      query: `
        mutation {
          register(email: "${faker.internet.email()}", password: "${faker.internet.password()}") {
            status
            errors {
              path
              message
            }
            user{
              _id
              email
            }
          }
        }
      `
    });

    expect(status).toBe(201);
  });
});
