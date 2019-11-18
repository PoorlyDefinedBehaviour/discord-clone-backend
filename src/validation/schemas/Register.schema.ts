import * as yup from "yup";

const register_schema = yup.object().shape({
  username: yup
    .string()
    .min(5, "Username must be at least 5 characters long")
    .max(255),
  email: yup
    .string()
    .min(5, "Email must be at least 5 characters long")
    .max(255)
    .email("Email must be a valid email"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(255)
});

export default register_schema;
