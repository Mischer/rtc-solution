import axios from "axios";

export class HttpMappingsProvider {
    async fetchMappings(): Promise<string> {
        const response = await axios.get("http://simulation:3000/api/mappings");
        return response.data.mappings;
    }
}