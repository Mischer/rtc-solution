import {HttpStateProvider} from "./http-state-provider";
import {HttpMappingsProvider} from "./http-mappings-provider";
import {parseMappings} from "../utils/parse-mappings";
import {parseEvent} from "../utils/parse-event";
import {Event} from "../model/Event";
import {logger} from "../logger";
import {Mappings} from "../model/Mappings";

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
            const eventLines = this.parseEventLines(stateRaw);

            const seenIds = new Set<string>();
            this.processEvents(eventLines, mappings, seenIds);
            this.markRemovedEvents(seenIds);
        } catch (err) {
            logger.error(`poll() failed: ${err}`);
        }
    }

    /**
     * Parse state string into trimmed, non-empty lines
     */
    private parseEventLines(stateRaw: string): string[] {
        return stateRaw
            .split("\n")
            .map(line => line.trim())
            .filter(line => line.length > 0);
    }

    /**
     * Process all event lines, updating state and collecting seen IDs
     */
    private processEvents(eventLines: string[], mappings: Mappings, seenIds: Set<string>): void {
        for (const line of eventLines) {
            const event = parseEvent(line, mappings);
            if (!event) continue;

            seenIds.add(event.id);
            this.updateOrInsertEvent(event);
        }
    }

    /**
     * Update or insert a single event, logging any changes
     */
    private updateOrInsertEvent(event: Event): void {
        const existingEvent = this.state.get(event.id);
        if (!existingEvent) {
            logger.info(`New event added: ${event.id}`);
            this.state.set(event.id, event);
            return;
        }

        let isChanged = false;
        if (existingEvent.status !== event.status) {
            logger.info(
                `Event ${event.id} status changed: ${existingEvent.status} -> ${event.status}`
            );
            isChanged = true;
        }

        const prevScores = JSON.stringify(existingEvent.scores);
        const newScores = JSON.stringify(event.scores);
        if (prevScores !== newScores) {
            logger.info(
                `Event ${event.id} scores changed: ${prevScores} -> ${newScores}`
            );
            isChanged = true;
        }

        if (isChanged) {
            this.state.set(event.id, event);
        }
    }

    /**
     * Mark events as REMOVED if they were not seen in this cycle
     */
    private markRemovedEvents(seenIds: Set<string>): void {
        for (const [id, event] of this.state.entries()) {
            if (!seenIds.has(id) && event.status !== "REMOVED") {
                logger.info(`Event removed: ${id}`);
                event.status = "REMOVED";
            }
        }
    }
}