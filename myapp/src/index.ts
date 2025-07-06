import express from "express";
import {HttpMappingsProvider} from "./service/http-mappings-provider";
import {createStateRouter} from "./routes/state.routes";
import {errorHandler} from "./middlewares/error-handler";
import {StateService} from "./service/state.service";
import {HttpStateProvider} from "./service/http-state-provider";

const app = express();
const port = 3001;

const mappingsProvider = new HttpMappingsProvider();
const stateProvider = new HttpStateProvider();
const stateService = new StateService(mappingsProvider, stateProvider);

stateService.start();

app.use(express.json());

// routes
app.use("/", createStateRouter(stateService));

app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});