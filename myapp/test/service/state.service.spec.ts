import { StateService } from "../../src/service/state.service";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import {HttpMappingsProvider} from "../../src/service/http-mappings-provider";
import {HttpStateProvider} from "../../src/service/http-state-provider";

describe("State Service Tests", () => {
    let service: StateService;
    let mappingsProvider: HttpMappingsProvider;
    let stateProvider: HttpStateProvider;

    let mockedMappingsProvider: any;
    let mockedStateProvider: any;

    beforeEach(() => {
        vi.useFakeTimers();
        vi.spyOn(global, "setInterval");
        vi.spyOn(global, "clearInterval");

        mappingsProvider = new HttpMappingsProvider();
        stateProvider = new HttpStateProvider();

        mockedMappingsProvider = mappingsProvider as any;
        mockedStateProvider = stateProvider as any;

        mockedMappingsProvider.fetchMappings = vi.fn().mockResolvedValue(
            "id1:TeamA;id2:TeamB;statusId:LIVE;periodId:CURRENT"
        );

        mockedStateProvider.fetchState = vi.fn().mockResolvedValue(
            "e1,id1,id2,1709900432183,id1,id2,statusId,periodId@1:0"
        );

        service = new StateService(mappingsProvider, stateProvider);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it("calls setInterval when started", () => {
        service.start();
        expect(setInterval).toHaveBeenCalledTimes(1);
        expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 1000);
    });

    it("does not call setInterval twice if already started", () => {
        service.start();
        service.start();
        expect(setInterval).toHaveBeenCalledTimes(1);
    });

    it("calls clearInterval when stopped", () => {
        service.start();
        service.stop();
        expect(clearInterval).toHaveBeenCalledTimes(1);
    });

    it("does not call clearInterval if not started", () => {
        service.stop();
        expect(clearInterval).not.toHaveBeenCalled();
    });

    it("adds a new event on poll", async () => {
        await service.poll();

        const state = service.getCurrentState();
        expect(state).toHaveLength(1);
        expect(state[0].id).toBe("e1");

        expect(mockedMappingsProvider.fetchMappings).toHaveBeenCalledTimes(1);
        expect(mockedStateProvider.fetchState).toHaveBeenCalledTimes(1);
    });
});