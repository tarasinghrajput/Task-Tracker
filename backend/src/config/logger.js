const { format, createLogger, transports } = require('winston')
const path = require('path')

const LOG_DIR = path.resolve(__dirname, '../../logs')

const consoleFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.colorize(),
    format.printf(({ timestamp, level, message, ...meta }) => {
        const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : ''
        return `${timestamp} [${level}]: ${message}${metaString}`
    }),
)

const fileFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.json(),
)

const logger = createLogger({
    level: process.env.LOG_LEVEL || 'info',
    defaultMeta: { service: 'task-tracker-api' },
    transports: [
        new transports.File({
            filename: path.join(LOG_DIR, 'error.log'),
            level: 'error',
            format: fileFormat,
            maxsize: 5 * 1024 * 1024,
            maxFiles: 5,
        }),
        new transports.File({
            filename: path.join(LOG_DIR, 'combined.log'),
            format: fileFormat,
            maxsize: 5 * 1024 * 1024,
            maxFiles: 10,
        }),
    ],
    exitOnError: false,
})

if (process.env.NODE_ENV !== 'production') {
    logger.add(new transports.Console({ format: consoleFormat }))
}

module.exports = logger
