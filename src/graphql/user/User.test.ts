import axios, { AxiosResponse } from "axios";
import faker from "faker";
import GraphQLEndPoint from "../GraphQLEndPoint";

export const register_user = async (
  username?: string,
  email?: string,
  password?: string
): Promise<any> => {
  username || (username = faker.internet.userName());
  email || (email = faker.internet.email());
  password || (password = faker.internet.password());

  const {
    data: {
      data: { register }
    }
  }: AxiosResponse<any> = await axios.post(GraphQLEndPoint, {
    query: `
      mutation {
        register(username: "${username}",email: "${email}", password: "${password}") {
          status
          errors {
            path
            message
          }
          token
          user{
            _id
            username
            email
            avatar
            friends {
              _id
            username
            email
            avatar
            }
            servers {
              _id
              name
              owner {
                _id
                username
                email
                avatar
              }
            }
            createdAt
          }
        }
      }
    `
  });

  return register;
};

describe("user test suite", () => {
  beforeAll(() => {
    faker.seed(Date.now());
  });

  test("register a user", async () => {
    const { status }: AxiosResponse<any> = await register_user();

    expect(status).toBe(201);
  });

  test("invalid email", async () => {
    const { status }: AxiosResponse<any> = await register_user(
      faker.internet.userName(),
      "abc",
      faker.internet.password()
    );

    expect(status).toBe(422);
  });

  test("invalid password", async () => {
    const { status }: AxiosResponse<any> = await register_user(
      faker.internet.userName(),
      faker.internet.email(),
      "12345"
    );

    expect(status).toBe(422);
  });

  test("login", async () => {
    const mock_password = faker.internet.password();
    const { user: mock_user }: any = await register_user(
      faker.internet.userName(),
      faker.internet.email(),
      mock_password
    );

    const {
      data: {
        data: {
          login: { status }
        }
      }
    }: AxiosResponse<any> = await axios.post(GraphQLEndPoint, {
      query: `
        mutation {
          login(email:"${mock_user.email}", password: "${mock_password}"){
            status
          }
        }
      `
    });

    expect(status).toBe(200);
  });

  test("fail to login with invalid credentials", async () => {
    const { user: mock_user }: any = await register_user(
      faker.internet.userName(),
      faker.internet.email(),
      faker.internet.password()
    );

    const {
      data: {
        data: {
          login: { status }
        }
      }
    }: AxiosResponse<any> = await axios.post(GraphQLEndPoint, {
      query: `
        mutation {
          login(email:"${
            mock_user.email
          }", password: "${faker.internet.password()}"){
            status
            errors {
              path
              message
            }
            token
            user{
              _id
              username
              email
            }
          }
        }
      `
    });

    expect(status).toBe(401);
  });

  test("query user by id", async () => {
    const { user: mock_user }: any = await register_user(
      faker.internet.userName(),
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
          user {
            _id
          }
        }
      }
      `
    });

    expect(mock_user._id).toBe(user._id);
  });

  test("query all users", async () => {
    await register_user(
      faker.internet.userName(),
      faker.internet.email(),
      faker.internet.password()
    );
    await register_user(
      faker.internet.userName(),
      faker.internet.email(),
      faker.internet.password()
    );

    const {
      data: {
        data: { errors }
      }
    }: any = await axios.post(GraphQLEndPoint, {
      query: `
      {
        users(page: 0) {
          errors {
            path
            message
          }
        }
      }
      `
    });

    expect(errors).toBeUndefined();
  });
});
