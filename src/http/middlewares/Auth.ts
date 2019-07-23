import { verify } from "jsonwebtoken";
import { Maybe } from "../../types/maybe";

import { NextFunction } from "express";

export const TokenDecoder = async (
  bearer_token: string
): Promise<Maybe<any>> => {
  try {
    const token = bearer_token.split(" ")[1];
    return await verify(token, process.env.JWT_SECRET as string);
  } catch (e) {
    console.log("auth", e);
    return { _id: null };
  }
};

export const TokenValidator = async (
  request: any,
  _: any,
  next: NextFunction
) => {
  try {
    request.token_payload = await TokenDecoder(request.headers
      .authorization as string);

    return next();
  } catch (e) {
    /**
     * Keep the flow going and let graphql resolver decide what to do
     */
    console.log("auth", e);
    return next();
  }
};
