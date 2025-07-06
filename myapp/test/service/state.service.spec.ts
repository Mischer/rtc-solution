import { StateService } from "../../src/service/state.service";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import {HttpMappingsProvider} from "../../src/service/http-mappings-provider";
import {HttpStateProvider} from "../../src/service/http-state-provider";
import {logger} from "../../src/logger";

describe("State Service Tests", () => {
    let stateService: StateService;
    let mappingsProvider: HttpMappingsProvider;
    let stateProvider: HttpStateProvider;

    let mockedMappingsProvider: any;
    let mockedStateProvider: any;

    beforeEach(() => {
        vi.useFakeTimers();
        vi.spyOn(global, "setInterval");
        vi.spyOn(global, "clearInterval");
        // @ts-ignore
        vi.spyOn(logger, "info").mockImplementation(() => {});
        // @ts-ignore
        vi.spyOn(logger, "error").mockImplementation(() => {});

        mappingsProvider = new HttpMappingsProvider();
        stateProvider = new HttpStateProvider();

        mockedMappingsProvider = mappingsProvider as any;
        mockedStateProvider = stateProvider as any;

        mockedStateProvider.fetchState = vi.fn().mockResolvedValue(
            "e1,id1,id2,1709900432183,id1,id2,statusId,periodId@1:0"
        );

        mockedMappingsProvider.fetchMappings = vi.fn().mockResolvedValue(
            "id1:TeamA;id2:TeamB;statusId:LIVE;periodId:CURRENT"
        );

        stateService = new StateService(mappingsProvider, stateProvider);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it("calls setInterval when started", () => {
        stateService.start();
        expect(setInterval).toHaveBeenCalledTimes(1);
        expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 1000);
    });

    it("does not call setInterval twice if already started", () => {
        stateService.start();
        stateService.start();
        expect(setInterval).toHaveBeenCalledTimes(1);
    });

    it("calls clearInterval when stopped", () => {
        stateService.start();
        stateService.stop();
        expect(clearInterval).toHaveBeenCalledTimes(1);
    });

    it("does not call clearInterval if not started", () => {
        stateService.stop();
        expect(clearInterval).not.toHaveBeenCalled();
    });

    it("adds a new event on poll", async () => {
        await stateService.poll();

        const state = stateService.getCurrentState();
        expect(state).toHaveLength(1);
        expect(state[0].id).toBe("e1");

        expect(mockedMappingsProvider.fetchMappings).toHaveBeenCalledTimes(1);
        expect(mockedStateProvider.fetchState).toHaveBeenCalledTimes(1);
    });

    it("updates existing event if status changes", async () => {
        await stateService.poll();

        mockedStateProvider.fetchState.mockResolvedValue(
            "e1,id1,id2,1709900432183,id1,id2,newStatusId,periodId@1:0"
        );

        mockedMappingsProvider.fetchMappings.mockResolvedValue(
            "id1:TeamA;id2:TeamB;newStatusId:FINISHED;periodId:CURRENT"
        );

        await stateService.poll();

        const updatedEvents = stateService.getCurrentState();
        expect(updatedEvents).toHaveLength(1);
        expect(updatedEvents[0].status).toBe("FINISHED");
        expect(logger.info).toHaveBeenCalledWith(`Event e1 status changed: LIVE -> FINISHED`);
    });

    it("updates existing event if score changes", async () => {
        await stateService.poll();

        mockedStateProvider.fetchState.mockResolvedValue(
            "e1,id1,id2,1709900432183,id1,id2,statusId,periodId@2:1"
        );

        await stateService.poll();

        const updatedEvents = stateService.getCurrentState();
        expect(updatedEvents).toHaveLength(1);
        expect(updatedEvents[0].scores.CURRENT.home).toBe("2");
        expect(updatedEvents[0].scores.CURRENT.away).toBe("1");
        expect(logger.info).toHaveBeenCalledWith(expect.stringContaining("scores changed"));
    });

    it("getCurrentState() does not return REMOVED events", async () => {
        await stateService.poll();

        mockedStateProvider.fetchState.mockResolvedValue("");

        await stateService.poll();

        const current = stateService.getCurrentState();
        expect(current).toHaveLength(0);
        expect(logger.info).toHaveBeenCalledWith("Event removed: e1");
    });
});