import { StateService } from "../../src/service/state.service";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

describe("State Service Tests", () => {
    let service: StateService;

    beforeEach(() => {
        vi.useFakeTimers();
        vi.spyOn(global, "setInterval");
        vi.spyOn(global, "clearInterval");
        service = new StateService();
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
});