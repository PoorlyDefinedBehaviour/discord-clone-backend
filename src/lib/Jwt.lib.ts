import { sign, verify } from "jsonwebtoken";

export default class Jwt {
  public static encode = (payload) =>
    sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: "24h"
    });

  public static decode = async (bearer_token: string) => {
    try {
      const [, token] = bearer_token.split(" ");

      const payload = await verify(token, process.env.JWT_SECRET as string);
      return payload;
    } catch (ex) {
      return null;
    }
  };

  public static refresh = async (token: string) =>
    Jwt.encode(await Jwt.decode(token));
}
