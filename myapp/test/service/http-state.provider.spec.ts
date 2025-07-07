import axios from "axios";
import { vi, describe, it, expect, beforeEach } from "vitest";
import {HttpStateProvider} from "../../src/service/http-state.provider";

type MockedAxios = {
    get: ReturnType<typeof vi.fn>;
};

vi.mock("axios");
const mockedAxios = axios as unknown as MockedAxios;

describe("Http State Provider Tests", () => {
    let provider: HttpStateProvider;

    beforeEach(() => {
        provider = new HttpStateProvider();
        mockedAxios.get.mockReset();
    });

    it("fetches state from API", async () => {
        mockedAxios.get.mockResolvedValue({
            data: { odds: "event1,event2" },
        });

        const result = await provider.fetchState();

        expect(mockedAxios.get).toHaveBeenCalledWith("http://simulation:3000/api/state");
        expect(result).toBe("event1,event2");
    });

    it("throws if API call fails", async () => {
        mockedAxios.get.mockRejectedValue(new Error("Network error"));

        await expect(provider.fetchState()).rejects.toThrow("Network error");
    });
});