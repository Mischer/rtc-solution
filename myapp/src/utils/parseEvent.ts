import { Event } from "../model/Event";
import { Mappings } from "../model/Mappings";

export function parseEvent(str: string, mappings: Mappings): Event | null {
    const [
        id,
        sportId,
        competitionId,
        startTimeStr,
        homeTeamId,
        awayTeamId,
        statusId,
        scoresRaw,
    ] = str.split(",");

    return {
        id,
        sport: mappings[sportId],
        competition: mappings[competitionId],
        startTime: new Date(Number(startTimeStr)).toISOString(),
        competitors: {
            HOME: { type: "HOME", name: mappings[homeTeamId] },
            AWAY: { type: "AWAY", name: mappings[awayTeamId] },
        },
        status: mappings[statusId],
        scores: {
            CURRENT: {
                type: "CURRENT",
                home: scoresRaw.split("@")[1].split(":")[0],
                away: scoresRaw.split("@")[1].split(":")[1],
            },
        },
    };
}