import { ValidationError } from "yup";

export interface FormattedYupError {
  status: number;
  path: string;
  message: string;
}

const format_yup_error = (error: ValidationError): Array<FormattedYupError> =>
  error.inner.map<any>(({ path, message }) => ({
    path,
    message
  }));

export default format_yup_error;
