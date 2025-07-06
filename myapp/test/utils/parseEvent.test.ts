import { describe, it, expect, vi, beforeEach } from "vitest";
import { parseEvent } from "../../src/utils/parseEvent";
import { logger } from "../../src/logger";
import { Event } from "../../src/model/Event";
import { Mappings } from "../../src/model/Mappings";

const mappings: Mappings = {
    "sportId": "FOOTBALL",
    "competitionId": "UEFA Europa League",
    "homeTeamId": "Real Madrid",
    "awayTeamId": "Barcelona",
    "PRE": "PRE",
    "CURRENT": "CURRENT",
};

describe("parseEvent", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        // @ts-ignore
        vi.spyOn(logger, "error").mockImplementation(() => {});
    });

    it("should parse a valid event line into Event", () => {
        const line =
            "event1,sportId,competitionId,1709900432183,homeTeamId,awayTeamId,PRE,CURRENT@1:2";

        const expected: Event = {
            id: "event1",
            sport: "FOOTBALL",
            competition: "UEFA Europa League",
            startTime: new Date(1709900432183).toISOString(),
            competitors: {
                HOME: { type: "HOME", name: "Real Madrid" },
                AWAY: { type: "AWAY", name: "Barcelona" },
            },
            status: "PRE",
            scores: {
                CURRENT: { type: "CURRENT", home: "1", away: "2" },
            },
        };

        expect(parseEvent(line, mappings)).toEqual(expected);
        expect(logger.error).not.toHaveBeenCalled();
    });

    it("should return null and log error if event line has only 7 params", () => {
        const lineWith7Words = [
            "event1",
            "sportId",
            "competitionId",
            "1709900432183",
            "homeTeamId",
            "awayTeamId",
            "PRE",
        ].join(",");

        expect(parseEvent(lineWith7Words, mappings)).toBeNull();
        expect(logger.error).toHaveBeenCalledWith(`parseEvent: invalid event line format: ${lineWith7Words}`);
    });

    it("should parse event line with 9 params (ignores extras)", () => {
        const lineWith9Words = [
            "event1",
            "sportId",
            "competitionId",
            "1709900432183",
            "homeTeamId",
            "awayTeamId",
            "PRE",
            "CURRENT@1:2",
            "EXTRA_FIELD",
        ].join(",");

        const result = parseEvent(lineWith9Words, mappings);
        expect(result).not.toBeNull();
        expect(result?.id).toBe("event1");
        expect(logger.error).not.toHaveBeenCalled();
    });
});