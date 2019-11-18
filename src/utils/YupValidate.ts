import formatYupError, { FormattedYupError } from "./FormatYupError";
import Maybe from "graphql/tsutils/Maybe";

export default async function yup_validate(
  schema,
  object
): Promise<Maybe<FormattedYupError[]>> {
  try {
    await schema.validate(object, { abortEarly: false });
    return null;
  } catch (ex) {
    return formatYupError(ex);
  }
}
