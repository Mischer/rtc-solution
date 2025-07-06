import { Request, Response } from "express";
import { StateService } from "../service/state.service";

export class StateController {
    constructor(private readonly stateService: StateService) {}

    getCurrentState = (_req: Request, res: Response) => {
        const state = this.stateService.getCurrentState();
        res.json(state);
    };
}