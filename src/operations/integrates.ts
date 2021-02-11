import { Operation } from "./operation";

export class IntegrateOperation implements Operation {
    public constructor() {}

    public exec() { return true; }

    public isExecutable() { return true; }
}