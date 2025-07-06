import {HttpStateProvider} from "./http-state-provider";
import {HttpMappingsProvider} from "./http-mappings-provider";
import {parseMappings} from "../utils/parse-mappings";
import {parseEvent} from "../utils/parse-event";
import {Event} from "../model/Event";
import {logger} from "../logger";

export class StateService {
    private state = new Map<string, Event>();
    private intervalId: NodeJS.Timeout | null = null;

    constructor(
        private mappingsProvider: HttpMappingsProvider,
        private stateProvider: HttpStateProvider
    ) {}

    start(): void {
        if (this.intervalId !== null) {
            return;
        }

        this.intervalId = setInterval(() => {
            this.poll();
        }, 1000);
    }

    stop(): void {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    getCurrentState(): Event[] {
        return Array.from(this.state.values()).filter(event => event.status !== "REMOVED");
    }

    async poll(): Promise<void> {
        try {
            const [mappingsRaw, stateRaw] = await Promise.all([
                this.mappingsProvider.fetchMappings(),
                this.stateProvider.fetchState()
            ]);

            const mappings = parseMappings(mappingsRaw);
            const eventLines = stateRaw.split("\n").map(l => l.trim()).filter((line) => line.length > 0);

            const seenIds = new Set<string>();

            for (const line of eventLines) {
                const event = parseEvent(line, mappings);
                if (!event) {
                    continue;
                }

                seenIds.add(event.id);

                const existingEvent = this.state.get(event.id);
                if (!existingEvent) {
                    logger.info(`New event added: ${event.id}`);
                    this.state.set(event.id, event);
                } else {
                    let isChanged = false;

                    if (existingEvent.status !== event.status) {
                        logger.info(`Event ${event.id} status changed: ${existingEvent.status} -> ${event.status}`);
                        isChanged = true;
                    }

                    const exisitngScores = JSON.stringify(existingEvent.scores);
                    const newScores = JSON.stringify(event.scores);
                    if (exisitngScores !== newScores) {
                        logger.info(`Event ${event.id} scores changed: ${exisitngScores} -> ${newScores}`);
                        isChanged = true;
                    }

                    if (isChanged) {
                        this.state.set(event.id, event);
                    }
                }
            }

            for (const [id, event] of this.state.entries()) {
                if (!seenIds.has(id) && event.status !== "REMOVED") {
                    logger.info(`Event removed: ${id}`);
                    event.status = "REMOVED";
                }
            }
        } catch (err) {
            logger.error(`poll() failed: ${err}`);
        }
    }
}