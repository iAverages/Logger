import logger from "../src/logger";
import fs from "fs";
import { resolve } from "path";
const text = "Hello";

const getDate = () => {
    const doubleDigit = (num: number) => (num < 10 ? `0${num}` : num);
    const today = new Date();
    const dd = today.getDate();
    const mm = today.getMonth() + 1;
    const yyyy = today.getFullYear();
    return `${doubleDigit(dd)}-${doubleDigit(mm)}-${yyyy}`;
};

describe("File logging", () => {
    beforeAll((done) => {
        logger.info(text);
        logger.error(text);
        // Wait 100 ms to allow for the file to be created.
        // There is still the possibility this can fail but
        // I don't think there is another way without allowing
        // await on logger.info(text);
        setTimeout(done, 100);
    });

    it("should create log file", () => {
        const path = resolve(__dirname, `../logs/log-${getDate()}.log`);
        expect(fs.existsSync(path)).toBe(true);
    });

    it("should create error log file", () => {
        const path = resolve(__dirname, `../logs/error-${getDate()}.log`);
        expect(fs.existsSync(path)).toBe(true);
    });
});
