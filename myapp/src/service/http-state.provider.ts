import axios from "axios";

export class HttpStateProvider {
    async fetchState(): Promise<string> {
        const response = await axios.get("http://simulation:3000/api/state");
        return response.data.odds;
    }
}