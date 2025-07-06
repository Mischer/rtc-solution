import { HttpMappingsProvider } from "../../src/service/http-mappings-provider";
import axios from "axios";
import { vi, describe, it, expect, beforeEach } from "vitest";

type MockedAxios = {
    get: ReturnType<typeof vi.fn>;
};

vi.mock("axios");
const mockedAxios = axios as unknown as MockedAxios;

describe("Http Mappings Provider Tests", () => {
    let provider: HttpMappingsProvider;

    beforeEach(() => {
        provider = new HttpMappingsProvider();
        mockedAxios.get.mockReset();
    });

    it("fetches mappings from API", async () => {
        mockedAxios.get.mockResolvedValue({
            data: { mappings: "foo:bar" },
        });

        const result = await provider.fetchMappings();

        expect(mockedAxios.get).toHaveBeenCalledWith("http://simulation:3000/api/mappings");
        expect(result).toBe("foo:bar");
    });

    it("throws an error call fails", async () => {
        mockedAxios.get.mockRejectedValue(new Error("Network error"));

        await expect(provider.fetchMappings()).rejects.toThrow("Network error");
    });
});