import request from "supertest";
import express, { Request, Response } from "express";
import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from "vitest";
import nock from "nock";
import { StateService } from "../../src/service/state.service";
import { HttpMappingsProvider } from "../../src/service/http-mappings.provider";
import { HttpStateProvider } from "../../src/service/http-state.provider";

describe("Integration with nock: GET /client/state", () => {
    beforeAll(() => {
        nock.disableNetConnect();
        nock.enableNetConnect("127.0.0.1");
    });

    afterAll(() => {
        nock.enableNetConnect();
    });

    afterEach(() => {
        nock.cleanAll();
    });

    it("returns parsed events after polling with HTTP providers", async () => {
        const app = express();

        nock("http://simulation:3000")
            .get("/api/mappings")
            .reply(
                200,
                {
                    mappings: [
                        "sportId:FOOTBALL",
                        "competitionId:UEFA",
                        "homeTeamId:Real Madrid",
                        "awayTeamId:Barcelona",
                        "PRE:PRE",
                        "e2d12fef:CURRENT",
                        "6c036000:PERIOD_1"
                    ].join(";")
                }
            );

        nock("http://simulation:3000")
            .get("/api/state")
            .reply(
                200,
                {
                    odds: [
                        "event1,sportId,competitionId,1709900432183,homeTeamId,awayTeamId,PRE,e2d12fef@1:2|6c036000@0:0"
                    ].join("\n")
                }
            );

        const stateService = new StateService(
            new HttpMappingsProvider(),
            new HttpStateProvider()
        );

        await stateService.poll();

        app.get("/client/state", (_req: Request, res: Response) => {
            res.json(stateService.getCurrentState());
        });

        const res = await request(app).get("/client/state");

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].id).toBe("event1");
        expect(res.body[0].scores).toEqual({
            CURRENT: { type: "CURRENT", home: "1", away: "2" },
            PERIOD_1: { type: "PERIOD_1", home: "0", away: "0" }
        });
    });
});