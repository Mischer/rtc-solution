import {Mappings} from "../model/Mappings";

export function parseMappings(str: string): Mappings {
    const mappings: Mappings = {};

    if (!str.trim()) {
        return mappings;
    }

    const pairs = str.split(";");

    for (const pair of pairs) {
        const [id, name] = pair.split(":");
        if (id && name) {
            mappings[id] = name;
        }
    }

    return mappings;
}