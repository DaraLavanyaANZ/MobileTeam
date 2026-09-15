import winston from 'winston';
import path from 'node:path';

const logDir = path.resolve(process.cwd(), 'reports/logs');

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ level, message, timestamp }) => `${timestamp} [${level.toUpperCase()}] ${message}`)
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp }) => `${timestamp} [${level}] ${message}`)
      )
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'mobile-framework.log'),
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5
    })
  ]
});

export class Logger {
  static info(message: string): void {
    logger.info(message);
  }

  static warn(message: string): void {
    logger.warn(message);
  }

  static error(message: string): void {
    logger.error(message);
  }

  static debug(message: string): void {
    logger.debug(message);
  }
}
