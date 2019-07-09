export const InternalServerError = {
  status: 500,
  path: null,
  message: "Something went wrong on our end"
};

export const UnprocessableEntity = {
  status: 422,
  path: null,
  message: "Couldn't find entity"
};

export const InvalidUserId = {
  status: 422,
  path: "id",
  message: "Id must be a valid id"
};

export const UserNotFound = {
  status: 404,
  path: null,
  message: "User not found"
};
export const EmailAlreadyInUse = {
  status: 422,
  path: "email",
  message: "Email already in use"
};

export const UserCreated = {
  status: 201,
  path: null,
  message: "User created"
};
