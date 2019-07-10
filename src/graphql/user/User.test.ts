import axios, { AxiosResponse } from "axios";
import faker from "faker";
import GraphQLEndPoint from "../GraphQLEndPoint";

const register_user = async (
  email: string,
  password: string
): Promise<AxiosResponse<any>> => {
  const { data }: any = await axios.post(GraphQLEndPoint, {
    query: `
      mutation {
        register(email: "${email}", password: "${password}") {
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

  return data;
};

describe("user test suite", () => {
  test("register a user", async () => {
    const {
      data: {
        register: { status }
      }
    }: any = await register_user(
      faker.internet.email(),
      faker.internet.password()
    );

    expect(status).toBe(201);
  });

  test("invalid email", async () => {
    const {
      data: {
        register: { status }
      }
    }: any = await register_user("abc", faker.internet.password());

    expect(status).toBe(422);
  });

  test("invalid password", async () => {
    const {
      data: {
        register: { status }
      }
    }: any = await register_user(faker.internet.email(), "12345");

    expect(status).toBe(422);
  });

  test("query user by id", async () => {
    const {
      data: {
        register: { user: mock_user }
      }
    }: any = await register_user(
      faker.internet.email(),
      faker.internet.password()
    );

    const {
      data: {
        data: {
          user: { user }
        }
      }
    }: AxiosResponse<any> = await axios.post(GraphQLEndPoint, {
      query: `
      {
        user(_id: "${mock_user._id}") {
          status
          user {
            _id
            email
            email_confirmed
            domain
          }
        }
      }
      
      `
    });

    expect(mock_user._id).toBe(user._id);
  });

  test("query all users", async () => {
    await register_user(faker.internet.email(), faker.internet.password());
    await register_user(faker.internet.email(), faker.internet.password());

    const {
      data: {
        data: {
          users: { users: users_array }
        }
      }
    }: AxiosResponse<any> = await axios.post(GraphQLEndPoint, {
      query: `
      {
        users(page: 0){
          status
          page 
          errors {
            path 
            message
          }
          users{
            _id
            email
            email_confirmed
            domain
          }
        }
      }
      `
    });

    expect(users_array.length).toBeGreaterThanOrEqual(2);
  });
});
