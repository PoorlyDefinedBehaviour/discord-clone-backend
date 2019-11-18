import axios from "axios";
import faker from "faker";
import GraphQLEndPoint from "../GraphQLEndPoint";

export const register_user = async (
  username?: string,
  email?: string,
  password?: string
) => {
  username || (username = faker.internet.userName());
  email || (email = faker.internet.email());
  password || (password = faker.internet.password());

  const {
    data: {
      data: { register }
    }
  } = await axios.post(GraphQLEndPoint, {
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
    const { status } = await register_user();

    expect(status).toBe(201);
  });

  test("invalid email", async () => {
    const { status } = await register_user(
      faker.internet.userName(),
      "abc",
      faker.internet.password()
    );

    expect(status).toBe(422);
  });

  test("invalid password", async () => {
    const { status } = await register_user(
      faker.internet.userName(),
      faker.internet.email(),
      "12345"
    );

    expect(status).toBe(422);
  });

  test("login", async () => {
    const mock_password = faker.internet.password();
    const { user: mock_user } = await register_user(
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
    } = await axios.post(GraphQLEndPoint, {
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
    const { user: mock_user } = await register_user(
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
    } = await axios.post(GraphQLEndPoint, {
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

  test("change username", async () => {
    const { token } = await register_user(
      faker.internet.userName(),
      faker.internet.email(),
      faker.internet.password()
    );

    const {
      data: {
        data: {
          change_username: { status }
        }
      }
    } = await axios.post(
      GraphQLEndPoint,
      {
        query: `
        mutation {
          change_username(username: "${faker.internet.userName()}") {
            status
            errors {
              path
              message
            }
         }
        }
      `
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    expect(status).toBe(201);
  });

  test("fail to change username without token", async () => {
    const {
      data: {
        data: {
          change_username: { status }
        }
      }
    } = await axios.post(
      GraphQLEndPoint,
      {
        query: `
        mutation {
          change_username(username: "${faker.internet.userName()}") {
            status
            errors {
              path
              message
            }
         }
        }
      `
      },
      {
        headers: { Authorization: `Bearer ${faker.internet.userName()}` }
      }
    );

    expect(status).toBe(401);
  });

  test("delete account", async () => {
    const { token } = await register_user(
      faker.internet.userName(),
      faker.internet.email(),
      faker.internet.password()
    );

    const {
      data: {
        data: {
          delete_account: { status }
        }
      }
    } = await axios.post(
      GraphQLEndPoint,
      {
        query: `
        mutation {
          delete_account {
            status
            errors {
              path
              message
            }
          }
        }
      `
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    expect(status).toBe(201);
  });

  test("fail to delete account without token", async () => {
    const {
      data: {
        data: {
          delete_account: { status }
        }
      }
    } = await axios.post(
      GraphQLEndPoint,
      {
        query: `
        mutation {
          delete_account {
            status
            errors {
              path
              message
            }
          }
        }
      `
      },
      {
        headers: { Authorization: `Bearer ${faker.internet.userName()}` }
      }
    );

    expect(status).toBe(401);
  });

  test("deactivate account", async () => {
    const { token } = await register_user(
      faker.internet.userName(),
      faker.internet.email(),
      faker.internet.password()
    );

    const {
      data: {
        data: {
          deactivate_account: { status }
        }
      }
    } = await axios.post(
      GraphQLEndPoint,
      {
        query: `
        mutation {
          deactivate_account {
            status
            errors {
              path
              message
            }
          }
        }
      `
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    expect(status).toBe(201);
  });

  test("update account", async () => {
    const { token } = await register_user(
      faker.internet.userName(),
      faker.internet.email(),
      faker.internet.password()
    );

    const {
      data: {
        data: {
          update_account: { status }
        }
      }
    } = await axios.post(
      GraphQLEndPoint,
      {
        query: `
        mutation {
          update_account(username: "${faker.internet.userName()}",
          email: "${faker.internet.email()}", 
          password: "${faker.internet.password()}"
          ) {
            status
            errors {
              path
              message
            }
          }
        }
      `
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    expect(status).toBe(201);
  });

  test("fail to update account without token", async () => {
    const {
      data: {
        data: {
          update_account: { status }
        }
      }
    } = await axios.post(
      GraphQLEndPoint,
      {
        query: `
        mutation {
          update_account(username: "${faker.internet.userName()}",
          email: "${faker.internet.email()}", 
          password: "${faker.internet.password()}"
          ) {
            status
            errors {
              path
              message
            }
          }
        }
      `
      },
      {
        headers: { Authorization: `Bearer ${faker.internet.userName()}` }
      }
    );

    expect(status).toBe(401);
  });

  test("send friend request", async () => {
    const { token: user_a_token } = await register_user(
      faker.internet.userName(),
      faker.internet.email(),
      faker.internet.password()
    );

    const {
      user: { _id: user_b_id }
    } = await register_user(
      faker.internet.userName(),
      faker.internet.email(),
      faker.internet.password()
    );

    const {
      data: {
        data: {
          send_friend_request: { status }
        }
      }
    } = await axios.post(
      GraphQLEndPoint,
      {
        query: `
        mutation {
          send_friend_request(_id: "${user_b_id}") {
            status
          }
        }
      `
      },
      {
        headers: { Authorization: `Bearer ${user_a_token}` }
      }
    );

    expect(status).toBe(200);
  });

  test("fail to send friend request without token", async () => {
    const {
      user: { _id }
    } = await register_user(
      faker.internet.userName(),
      faker.internet.email(),
      faker.internet.password()
    );

    const {
      data: {
        data: {
          send_friend_request: { status }
        }
      }
    } = await axios.post(
      GraphQLEndPoint,
      {
        query: `
        mutation {
          send_friend_request(_id: "${_id}") {
            status
          }
        }
      `
      },
      {
        headers: { Authorization: `Bearer ${faker.internet.userName()}` }
      }
    );

    expect(status).toBe(401);
  });

  test("query user by id", async () => {
    const { user: mock_user } = await register_user(
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
    } = await axios.post(GraphQLEndPoint, {
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
    } = await axios.post(GraphQLEndPoint, {
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
