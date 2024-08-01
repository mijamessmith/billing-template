import { createLogger, format, transports, addColors } from 'winston';
const { combine, label, timestamp, colorize } = format;

const logger = createLogger({
  level: 'info',
  defaultMeta: { service: 'clickhouse-api' },
  transports: [new transports.Console({
    format: combine(
      colorize({
        all: true
      }),
      label({ label: '[clickhouse-api]' }),
      timestamp({
        format:'hh:mm:ss.SSS'
      }),
      format.printf(
        info => `${info.timestamp} ${info.level} ${info.label} ${info.message}`
      )
    ),
  })]
});

addColors({
  error: 'red',
  warn: 'yellow',
  info: 'cyan',
  debug: 'green'
});

export default logger;
