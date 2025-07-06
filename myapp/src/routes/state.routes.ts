import { Router } from "express";
import { StateController } from "../controllers/state.controller";
import { StateService } from "../service/state.service";

export function createStateRouter(stateService: StateService): Router {
    const router = Router();
    const controller = new StateController(stateService);

    router.get("/client/state", controller.getCurrentState);

    return router;
}