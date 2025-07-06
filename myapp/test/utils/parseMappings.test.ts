import { describe, it, expect, vi, beforeEach } from "vitest";
import { parseMappings } from "../../src/utils/parseMappings";
import { Mappings } from "../../src/model/Mappings";
import { logger } from "../../src/logger";

describe("Parse Mappings Tests", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        // @ts-ignore
        vi.spyOn(logger, "warn").mockImplementation(() => {});
        // @ts-ignore
        vi.spyOn(logger, "error").mockImplementation(() => {});
    });

    it("should parse a valid mappings string into an object", () => {
        const raw =
            "29190088-763e-4d1c-861a-d16dbfcf858c:Real Madrid;" +
            "33ff69aa-c714-470c-b90d-d3883c95adce:Barcelona";

        const expected = {
            "29190088-763e-4d1c-861a-d16dbfcf858c": "Real Madrid",
            "33ff69aa-c714-470c-b90d-d3883c95adce": "Barcelona",
        } as Mappings;

        expect(parseMappings(raw)).toEqual(expected);
        expect(logger.error).not.toHaveBeenCalled();
        expect(logger.warn).not.toHaveBeenCalled();
    });

    it("should log warning if input is empty", () => {
        parseMappings("");
        expect(logger.warn).toHaveBeenCalledWith(
            "parseMappings: empty mappings string received"
        );
    });

    it.each([
        ["invalidpairwithoutcolon", 'parseMappings: invalid mapping pair: "invalidpairwithoutcolon"'],
        [":missingId", 'parseMappings: invalid mapping pair: ":missingId"'],
        ["missingName:", 'parseMappings: invalid mapping pair: "missingName:"'],
        [":", 'parseMappings: invalid mapping pair: ":"']
    ])(
        "should log error for invalid pair '%s'",
        (input, expectedLog) => {
            parseMappings(input);
            expect(logger.error).toHaveBeenCalledWith(expectedLog);
        }
    );
});