import { verify } from "jsonwebtoken";
import { Maybe } from "../../types/maybe";

import { Request, Response, NextFunction } from "express";

export const TokenDecoder = async (
  bearer_token: string
): Promise<Maybe<any>> => {
  try {
    const token = bearer_token.split(" ")[1];
    return await verify(token, process.env.JWT_SECRET as string);
  } catch (e) {
    return null;
  }
};

export const TokenValidator = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    (request as any).token_payload = await TokenDecoder(request.headers
      .authorization as string);
    return next();
  } catch (e) {
    /**
     * Keep the flow going and let graphql resolver decide what to do
     */
    return next();
  }
};
