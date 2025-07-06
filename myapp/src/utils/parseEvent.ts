import {Event, Score} from "../model/Event";
import { Mappings } from "../model/Mappings";
import {logger} from "../logger";

export function parseEvent(str: string, mappings: Mappings): Event | null {
    const params = str.split(",");
    if (params.length < 8) {
        logger.error(`parseEvent: invalid event line format: ${str}`);
        return null;
    }

    const [
        id,
        sportId,
        competitionId,
        startTimeStr,
        homeTeamId,
        awayTeamId,
        statusId,
        scoresRaw,
    ] = params;

    const sport = resolveMapping("sportId", sportId, mappings);
    const competition = resolveMapping("competitionId", competitionId, mappings);
    const homeName = resolveMapping("homeTeamId", homeTeamId, mappings);
    const awayName = resolveMapping("awayTeamId", awayTeamId, mappings);
    const status = resolveMapping("statusId", statusId, mappings);

    if (!sport || !competition || !homeName || !awayName || !status) {
        return null;
    }

    const scores = parseScores(scoresRaw, mappings);
    if (!scores) {
        return null;
    }

    return {
        id,
        sport,
        competition,
        startTime: new Date(Number(startTimeStr)).toISOString(),
        competitors: {
            HOME: { type: "HOME", name: homeName },
            AWAY: { type: "AWAY", name: awayName },
        },
        status,
        scores,
    };
}

function resolveMapping(label: string, id: string, mappings: Mappings): string | null {
    const value = mappings[id];
    if (!value) {
        logger.error(`Missing mapping for ${label}: ${id}`);
    }
    return value ?? null;
}

function parseScores(scoresRaw: string, mappings: Mappings): Record<string, Score> | null {
    const [periodPart, scorePart] = scoresRaw.split("@");
    if (!periodPart || !scorePart || !scorePart.includes(":")) {
        logger.error(`parseEvent: invalid scoresRaw format: ${scoresRaw}`);
        return null;
    }

    const [homeScore, awayScore] = scorePart.split(":");
    if (!homeScore || !awayScore) {
        logger.error(`parseEvent: invalid scoresRaw format: ${scoresRaw}`);
        return null;
    }

    const period = mappings[periodPart];
    if (!period) {
        logger.error(`Missing mapping for periodId: ${periodPart}`);
        return null;
    }

    return {
        [period]: { type: period, home: homeScore, away: awayScore },
    };
}