export type Competitor = {
    type: "HOME" | "AWAY";
    name: string;
};

export type Score = {
    type: string;
    home: string;
    away: string;
};

export type Event = {
    id: string;
    sport: string;
    competition: string;
    startTime: string;
    competitors: {
        HOME: Competitor;
        AWAY: Competitor;
    };
    status: string;
    scores: Record<string, Score>;
};