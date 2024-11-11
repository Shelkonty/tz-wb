import log4js from 'log4js';

log4js.configure({
    appenders: {
        console: { type: 'console' },
        file: { type: 'file', filename: 'app.log' }
    },
    categories: {
        default: {
            appenders: ['console', 'file'],
            level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
        }
    }
});

export const logger = log4js.getLogger();