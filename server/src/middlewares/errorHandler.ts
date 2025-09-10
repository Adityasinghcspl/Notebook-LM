import constants from './constants'
import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  statusCode?: number;
}

const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction): void => {
  if (res.headersSent) {
    return next(err);
  }

 const statusCode = err.statusCode ?? 500;

  const errorResponse = {
    title: 'Error',
    message: err.message || 'An unexpected error occurred',
    stackTrace: process.env.NODE_ENV === 'production' ? null : err.stack,
  };

  switch (statusCode) {
    case constants.VALIDATION_ERROR:
      errorResponse.title = 'Validation Failed';
      break;
    case constants.NOT_FOUND:
      errorResponse.title = 'Not Found';
      break;
    case constants.UNAUTHORIZED:
      errorResponse.title = 'Unauthorized';
      break;
    case constants.FORBIDDEN:
      errorResponse.title = 'Forbidden';
      break;
    case constants.SERVER_ERROR:
      errorResponse.title = 'Server Error';
      break;
    default:
      errorResponse.title = 'Error';
      break;
  }

  res.status(statusCode).json(errorResponse);
};

export default errorHandler;
