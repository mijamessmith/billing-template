import { Request, Response, NextFunction } from 'express';
import { AUTHORIZATION_TOKEN } from '../config';
import logger from '../logger';
/*
  This basic template takes the place of passport or another likewise serializer
*/
export const authorize = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (req.path.includes('api-docs')) {
    return next();
  }
  logger.info(`Authorizing`)
  if (authHeader === AUTHORIZATION_TOKEN) {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Invalid Authorization Token' });
  }
};