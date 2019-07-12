export const InternalServerError = {
  path: null,
  message: "Something went wrong on our end"
};

export const UnprocessableEntity = {
  path: null,
  message: "Couldn't find entity"
};

export const InvalidUserId = {
  path: "_id",
  message: "User id must be a valid id"
};

export const UserNotFound = {
  path: null,
  message: "User not found"
};

export const EmailAlreadyInUse = {
  path: "email",
  message: "Email already in use"
};

export const ServerNameInUse = {
  path: "name",
  message: "Server name is already in use"
};

export const InvalidCredentials = {
  message: "Invalid credentials",
  path: "email"
};

export const TokenRequired = {
  message: "A token is required",
  path: "authorization"
};

export const FailedToCreateServer = {
  message: "Couldn't create server, try again later",
  path: null
};

export const InvalidServerId = {
  message: "Server id must be a valid id",
  path: "_id"
};

export const ServerNotFound = {
  path: null,
  message: "Server not found"
};
