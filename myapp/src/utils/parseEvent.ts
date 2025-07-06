import { Event } from "../model/Event";
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

    const sport = mappings[sportId];
    if (!sport) {
        logger.error(`Missing mapping for sportId: ${sportId}`);
        return null;
    }

    const competition = mappings[competitionId];
    if (!competition) {
        logger.error(`Missing mapping for competitionId: ${competitionId}`);
        return null;
    }

    const homeName = mappings[homeTeamId];
    if (!homeName) {
        logger.error(`Missing mapping for homeTeamId: ${homeTeamId}`);
        return null;
    }

    const awayName = mappings[awayTeamId];
    if (!awayName) {
        logger.error(`Missing mapping for awayTeamId: ${awayTeamId}`);
        return null;
    }

    const status = mappings[statusId];
    if (!status) {
        logger.error(`Missing mapping for statusId: ${statusId}`);
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
        scores: {
            CURRENT: {
                type: "CURRENT",
                home: scoresRaw.split("@")[1].split(":")[0],
                away: scoresRaw.split("@")[1].split(":")[1],
            },
        },
    };
}