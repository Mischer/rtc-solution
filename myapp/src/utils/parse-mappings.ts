import {Mappings} from "../model/Mappings";
import { logger } from "../logger";

export function parseMappings(str: string): Mappings {
    const mappings: Mappings = {};

    if (!str.trim()) {
        logger.warn("parseMappings: empty mappings string received");
        return mappings;
    }

    const pairs = str.split(";");

    for (const pair of pairs) {
        if (!pair.trim()) continue;

        const [id, name] = pair.split(":").map((s) => s.trim());
        if (!id || !name) {
            logger.error(`parseMappings: invalid mapping pair: "${pair}"`);
            continue;
        }

        mappings[id] = name;
    }

    return mappings;
}