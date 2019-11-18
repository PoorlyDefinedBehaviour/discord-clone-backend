import { Request, Response, NextFunction } from "express";
import { getStatusText, INTERNAL_SERVER_ERROR, OK } from "http-status-codes";

export default function global_exception_handler(
  error: Error,
  _: Request,
  response: Response,
  __: NextFunction
): Response {
  console.error(error);

  return /prod/gi.test(process.env.NODE_ENV as string)
    ? response.status(OK).json({
        status: INTERNAL_SERVER_ERROR,
        errors: [{ message: getStatusText(INTERNAL_SERVER_ERROR) }]
      })
    : response.status(OK).json({
        status: INTERNAL_SERVER_ERROR,
        errors: [{ message: error }]
      });
}
