import { describe, it, expect, vi, beforeEach } from "vitest";
import { parseEvent } from "../../src/utils/parse-event";
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

    it.each([
        [
            "missing sportId",
            "event1,missingSport,competitionId,1709900432183,homeTeamId,awayTeamId,PRE,CURRENT@1:2",
            "Missing mapping for sportId: missingSport",
        ],
        [
            "missing homeTeamId",
            "event1,sportId,competitionId,1709900432183,missingHome,awayTeamId,PRE,CURRENT@1:2",
            "Missing mapping for homeTeamId: missingHome",
        ],
        [
            "missing competitionId",
            "event1,sportId,missingCompetition,1709900432183,homeTeamId,awayTeamId,PRE,CURRENT@1:2",
            "Missing mapping for competitionId: missingCompetition",
        ],
        [
            "missing awayTeamId",
            "event1,sportId,competitionId,1709900432183,homeTeamId,missingAway,PRE,CURRENT@1:2",
            "Missing mapping for awayTeamId: missingAway",
        ],
        [
            "missing statusId",
            "event1,sportId,competitionId,1709900432183,homeTeamId,awayTeamId,missingStatus,CURRENT@1:2",
            "Missing mapping for statusId: missingStatus",
        ],
    ])(
        "should return null and log error if %s",
        (_, line, expectedLog) => {
            expect(parseEvent(line, mappings)).toBeNull();
            expect(logger.error).toHaveBeenCalledWith(expectedLog);
        }
    );

    it("should parse scoresRaw with mapped period", () => {
        const line = "event1,sportId,competitionId,1709900432183,homeTeamId,awayTeamId,PRE,CURRENT@1:2";

        const result = parseEvent(line, mappings);

        expect(result?.scores["CURRENT"]).toEqual({
            type: "CURRENT",
            home: "1",
            away: "2",
        });
    });

    it("should correctly parse multiple score periods", () => {
        const line =
            "event1,sportId,competitionId,1709900432183,homeTeamId,awayTeamId,PRE," +
            "e2d12fef@1:2|6c036000@3:4";

        const mappings: Mappings = {
            sportId: "FOOTBALL",
            competitionId: "UEFA",
            homeTeamId: "Real Madrid",
            awayTeamId: "Barcelona",
            PRE: "PRE",
            e2d12fef: "CURRENT",
            "6c036000": "PERIOD_1",
        };

        const result = parseEvent(line, mappings);

        expect(result).not.toBeNull();
        expect(result!.scores).toEqual({
            CURRENT: { type: "CURRENT", home: "1", away: "2" },
            PERIOD_1: { type: "PERIOD_1", home: "3", away: "4" },
        });
    });

    it("should return null and log error if scoresRaw contains unknown periodId", () => {
        const line =
            "event1,sportId,competitionId,1709900432183,homeTeamId,awayTeamId,PRE,unknownPeriod@1:2";

        expect(parseEvent(line, mappings)).toBeNull();
        expect(logger.error).toHaveBeenCalledWith(
            "Missing mapping for periodId: unknownPeriod"
        );
    });

    it.each([
        [
            "missing @ separator",
            "event1,sportId,competitionId,1709900432183,homeTeamId,awayTeamId,PRE,invalidScoresRaw",
            "parseEvent: invalid scoresRaw format: invalidScoresRaw",
        ],
        [
            "missing : in score part",
            "event1,sportId,competitionId,1709900432183,homeTeamId,awayTeamId,PRE,CURRENT@invalid",
            "parseEvent: invalid scoresRaw format: CURRENT@invalid",
        ],
        [
            "empty after @",
            "event1,sportId,competitionId,1709900432183,homeTeamId,awayTeamId,PRE,CURRENT@",
            "parseEvent: invalid scoresRaw format: CURRENT@",
        ],
        [
            "missing away score",
            "event1,sportId,competitionId,1709900432183,homeTeamId,awayTeamId,PRE,CURRENT@1:",
            "parseEvent: invalid scoresRaw format: CURRENT@1:",
        ],
        [
            "missing home score",
            "event1,sportId,competitionId,1709900432183,homeTeamId,awayTeamId,PRE,CURRENT@:2",
            "parseEvent: invalid scoresRaw format: CURRENT@:2",
        ],
        [
            "both home and away scores empty",
            "event1,sportId,competitionId,1709900432183,homeTeamId,awayTeamId,PRE,CURRENT@:",
            "parseEvent: invalid scoresRaw format: CURRENT@:",
        ],
    ])(
        "should return null and log error if scoresRaw is invalid: %s",
        (_, line, expectedLog) => {
            expect(parseEvent(line, mappings)).toBeNull();
            expect(logger.error).toHaveBeenCalledWith(expectedLog);
        }
    );
});