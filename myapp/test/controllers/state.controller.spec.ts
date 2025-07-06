import express, { Request, Response } from "express";
import request from "supertest";
import { describe, it, expect, vi } from "vitest";
import { StateService } from "../../src/service/state.service";

describe("GET /client/state", () => {
    it("returns an array of events", async () => {
        const app = express();

        const stateService = {
            getCurrentState: vi.fn(() => [{ id: "e1" }])
        } as unknown as StateService;

        app.get("/client/state", (_req: Request, res: Response) => {
            res.json(stateService.getCurrentState());
        });

        const res = await request(app).get("/client/state");

        expect(res.status).toBe(200);
        expect(res.body).toEqual([{ id: "e1" }]);
    });
});