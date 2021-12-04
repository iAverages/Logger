import * as fs from "fs";
import colors from "colors";
import axios from "axios";
import { Writable } from "stream";

const streamMap = new Map<string, Writable>();

enum LogLevel {
    ERROR,
    INFO,
    SUCCESS,
    WARN,
    DEBUG,
}

const getDate = () => {
    const doubleDigit = (num: number) => (num < 10 ? `0${num}` : num);
    const today = new Date();
    const dd = today.getDate();
    const mm = today.getMonth() + 1;
    const yyyy = today.getFullYear();
    return `${doubleDigit(dd)}-${doubleDigit(mm)}-${yyyy}`;
};

const genObj = (prefix: string, color: Function, logPath?: string[]) => {
    return { prefix, color, logPath };
};

const getLogLevelInfo = (level: LogLevel) => {
    switch (level) {
        case LogLevel.ERROR:
            return genObj("[ERROR]", colors.red, [`./logs/`, `error-${getDate()}.log`]);
        case LogLevel.DEBUG:
            return genObj("[UWU]", colors.magenta);
        case LogLevel.INFO:
            return genObj("[INFO]", colors.cyan, [`./logs/`, `log-${getDate()}.log`]);
        case LogLevel.SUCCESS:
            return genObj("[SUCCESS]", colors.green, [`./logs/`, `log-${getDate()}.log`]);
        case LogLevel.WARN:
            return genObj("[WARN]", colors.yellow, [`./logs/`, `error-${getDate()}.log`]);
    }
};

/**
 * Prefix message with timestamp
 * @param {String} message
 */
const logger = async (level: LogLevel, message: string | Error) => {
    const date = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
    const logInfo = getLogLevelInfo(level);
    const dateFormat = `[${date}]`;
    // .replace fixes weird encoding issues I couldnt work out.
    const logMessage = `${dateFormat} ${logInfo.prefix} ${message}`.replace("[0m", "");
    // prettier-ignore
    const logMessageColor = `${colors.gray(dateFormat)} ${logInfo.color(logInfo.prefix)} ${message}`;
    if (level === LogLevel.ERROR) {
        console.error(logMessageColor);
    } else if (level === LogLevel.WARN) {
        console.warn(logMessageColor);
    } else {
        console.log(logMessageColor);
    }
    if (logInfo.logPath != null && streamMap.has(logInfo.logPath.join(""))) {
        const fsStream = streamMap.get(logInfo.logPath.join(""));
        // There is a check right above it no?
        // @ts-ignore
        fsStream.write(logMessage + "\n");
    } else if (logInfo.logPath) {
        try {
            await fs.promises.access(logInfo.logPath[0]);
        } catch (_) {
            fs.mkdirSync(logInfo.logPath[0], { recursive: true });
        }
        const fsStream = fs.createWriteStream(logInfo.logPath.join(""), { flags: "a" });
        streamMap.set(logInfo.logPath.join(""), fsStream);
        fsStream.write(logMessage + "\n");
    }
};

/**
 * Log a debug message. Prefixed with a magenta [UWU]
 * @param {String} message
 */
export const uwu = (message: string) => {
    if (process.env.NODE_ENV === "development" || process.env.LOG_DEBUG?.toLowerCase() === "true")
        logger(LogLevel.DEBUG, message);
};

/**
 * Log a info message. Prefixed with a cyan [INFO]
 * @param {String} message
 */
export const info = (message: string) => {
    logger(LogLevel.INFO, message);
};

/**
 * Log a success message. Prefixed with a green [SUCCESS]
 * @param {String} message
 */
export const success = (message: string) => {
    logger(LogLevel.SUCCESS, message);
};

/**
 * Log a warn message. Prefixed with a yellow [WARN]
 * @param {String} message
 */
export const warn = (message: string) => {
    logger(LogLevel.WARN, message);
};

/**
 * Log an error message. Prefixed with [ERROR], whole message is in red.
 * @param {String} message
 */
export const error = (message: string | Error, ping = false) => {
    logger(LogLevel.ERROR, message);
    if (ping && process.env.DISCORD_ERROR_WEBHOOK) {
        try {
            axios.post(process.env.DISCORD_ERROR_WEBHOOK, {
                content: (process.env.DISCORD_PING_ID && `<@${process.env.DISCORD_PING_ID}>`) + `${message}`,
            });
        } catch (err) {
            logger(LogLevel.ERROR, `Error while sending message to webhook: ${err.message}`);
        }
    }
};

["SIGTERM", "SIGINT"].forEach((event) => {
    process.on(event, () => {
        streamMap.forEach((stream) => stream.end);
    });
});

export default {
    info,
    error,
    success,
    warn,
    uwu,
    debug: uwu,
};
