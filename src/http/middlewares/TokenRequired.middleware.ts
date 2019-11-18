import { NextFunction } from "express";
import Jwt from "../../lib/Jwt.lib";

export default async function token_validator(request, _, next: NextFunction) {
  const payload = await Jwt.decode(request.headers.authorization);

  request.token_payload = payload || { _id: null };

  return next();
}
