import { describe, it, expect } from "vitest";
import {Mappings} from "../../src/model/Mappings";
import { parseMappings } from "../../src/utils/parseMappings";

describe("Parse Mappings Tests", () => {
    it("should parse a valid mappings string into an object", () => {
        const raw =
            "29190088-763e-4d1c-861a-d16dbfcf858c:Real Madrid;" +
            "33ff69aa-c714-470c-b90d-d3883c95adce:Barcelona";

        const expected = {
            "29190088-763e-4d1c-861a-d16dbfcf858c": "Real Madrid",
            "33ff69aa-c714-470c-b90d-d3883c95adce": "Barcelona"
        } as Mappings;

        expect(parseMappings(raw)).toEqual(expected);
    });

    it("should return an empty object if input is empty", () => {
        expect(parseMappings("")).toEqual({});
    });
});