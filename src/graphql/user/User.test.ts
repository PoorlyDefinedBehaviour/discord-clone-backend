import axios, { AxiosResponse } from "axios";
import faker from "faker";
import GraphQLEndPoint from "../GraphQLEndPoint";

export const register_user = async (
  username: string,
  email: string,
  password: string
): Promise<AxiosResponse<any>> => {
  const { data }: AxiosResponse<any> = await axios.post(GraphQLEndPoint, {
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
          }
        }
      }
    `
  });

  return data;
};

describe("user test suite", () => {
  beforeAll(() => faker.seed(Date.now()));

  test("register a user", async () => {
    const {
      data: {
        register: { status }
      }
    }: AxiosResponse<any> = await register_user(
      faker.internet.userName(),
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
    }: AxiosResponse<any> = await register_user(
      faker.internet.userName(),
      "abc",
      faker.internet.password()
    );

    expect(status).toBe(422);
  });

  test("invalid password", async () => {
    const {
      data: {
        register: { status }
      }
    }: AxiosResponse<any> = await register_user(
      faker.internet.userName(),
      faker.internet.email(),
      "12345"
    );

    expect(status).toBe(422);
  });

  test("login", async () => {
    const mock_password = faker.internet.password();
    const {
      data: {
        register: { user: mock_user }
      }
    }: AxiosResponse<any> = await register_user(
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

    expect(status).toBe(200);
  });

  test("fail to login with invalid credentials", async () => {
    const {
      data: {
        register: { user: mock_user }
      }
    }: AxiosResponse<any> = await register_user(
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
    const {
      data: {
        register: { user: mock_user }
      }
    }: any = await register_user(
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
          status
          errors {
            path
            message
          }
          token
          user {
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
            friend_requests {
              _id
              username
              email
              avatar
            }
            servers {
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
              members {
                _id
                username
                email
                avatar
              }
            }
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
            username
            email
          }
        }
      }
      `
    });

    expect(users_array.length).toBeGreaterThanOrEqual(2);
  });
});
