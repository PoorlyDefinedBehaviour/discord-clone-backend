import { Request, Response, NextFunction } from "express";

export default (
  request: Request,
  response: Response,
  next: NextFunction
): any => {
  response.header("Access-Control-Allow-Origin", "*");
  response.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Request-with, Content-Type, Accept, Authorization"
  );

  if (request.method === "OPTIONS") {
    response.header(
      "Access-Control-Allow-Methods",
      "PUT, POST, PATCH, DELETE, GET"
    );
    return response.status(200).json({});
  }
  next();
};
