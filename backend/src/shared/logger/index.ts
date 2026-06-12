import winston from 'winston';
import { getRequestId } from '../../config/request-context';

const requestContextFormat = winston.format((info) => {
  const requestId = getRequestId();
  if (requestId) info.requestId = requestId;
  return info;
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    requestContextFormat(),
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    process.env.NODE_ENV === 'production'
      ? winston.format.json()
      : winston.format.prettyPrint()
  ),
  transports: [new winston.transports.Console()],
});

export default logger;
