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
        return Array.from(this.state.values());
    }

    async poll(): Promise<void> {
        try {
            const [mappingsRaw, stateRaw] = await Promise.all([
                this.mappingsProvider.fetchMappings(),
                this.stateProvider.fetchState()
            ]);

            const mappings = parseMappings(mappingsRaw);
            const eventLines = stateRaw.split("\n").map(l => l.trim()).filter(line => line.length > 0);

            for (const line of eventLines) {
                const event = parseEvent(line, mappings);
                if (!event) {
                    continue
                };

                this.state.set(event.id, event);
            }
        } catch (err) {
            logger.error(`poll() failed: ${err}`);
        }
    }
}