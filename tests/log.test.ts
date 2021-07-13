import logger from "../src/logger";
import colors from "colors";
const text = "Hello";

// Remove the [date time] from the logs
const fixText = (t: string): string => {
    return t.split(" ").splice(2).join(" ");
};

describe("Logger", () => {
    it("should print [INFO] message", () => {
        console.log = jest.fn();
        logger.info(text);
        const logOutput = (console.log as jest.Mock).mock.calls[0][0];
        expect(fixText(logOutput)).toBe(`${colors.cyan("[INFO]")} ${text}`);
    });

    it("should call console.log 2 times", async () => {
        console.log = jest.fn();
        logger.debug(text);
        logger.info(text);
        logger.success(text);
        logger.uwu(text);
        expect((console.log as jest.Mock).mock.calls.length).toBe(2);
    });

    it("should call console.log 4 times in development environment", async () => {
        process.env.NODE_ENV = "development";
        console.log = jest.fn();
        logger.debug(text);
        logger.info(text);
        logger.success(text);
        logger.uwu(text);
        expect((console.log as jest.Mock).mock.calls.length).toBe(4);
    });

    it("should call console.error 1 time", () => {
        console.error = jest.fn();
        logger.error(text);
        expect((console.error as jest.Mock).mock.calls.length).toBe(1);
    });

    it("should call console.warn 1 time", () => {
        console.warn = jest.fn();
        logger.warn(text);
        expect((console.warn as jest.Mock).mock.calls.length).toBe(1);
    });
});
