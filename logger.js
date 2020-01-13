const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
        new winston.transports.File({
            filename: 'combined.log',
        }),
        new winston.transports.File({
            filename: 'errors.log',
            level: 'error'
        })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

module.exports.info = () => logger.info.apply(logger, formatLogArguments(arguments));
module.exports.warn = () => logger.info.apply(logger, formatLogArguments(arguments));
module.exports.debug = () => logger.info.apply(logger, formatLogArguments(arguments));
module.exports.verbose = () => logger.info.apply(logger, formatLogArguments(arguments));
module.exports.error = () => logger.info.apply(logger, formatLogArguments(arguments));

function formatLogArguments(args) {
    args = Array.prototype.slice.call(args);
    let stackInfo = getStackInfo(1);
    if (stackInfo) {
        let calleeStr = `(${stackInfo.relativePath}:${stackInfo.line})`;

        if (typeof (args[0]) === 'string') {
            args[0] = args[0] + ' ' + calleeStr
        } else {
            args.unshift(calleeStr);
        }
    }
    return args;
}

function getStackInfo(stackIndex) {
    // get call stack, and analyze it
    // get all file, method, and line numbers
    const stacklist = (new Error()).stack.split('\n').slice(3)

    // stack trace format:
    // http://code.google.com/p/v8/wiki/JavaScriptStackTraceApi
    // do not remove the regex expresses to outside of this method (due to a BUG in node.js)
    const stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/gi
    const stackReg2 = /at\s+()(.*):(\d*):(\d*)/gi

    const s = stacklist[stackIndex] || stacklist[0]
    const sp = stackReg.exec(s) || stackReg2.exec(s)

    if (sp && sp.length === 5) {
        return {
            method: sp[1],
            relativePath: path.relative(PROJECT_ROOT, sp[2]),
            line: sp[3],
            pos: sp[4],
            file: path.basename(sp[2]),
            stack: stacklist.join('\n')
        }
    }
}