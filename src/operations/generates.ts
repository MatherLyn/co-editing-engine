import { Operation } from "./operation";

export class GenerateOperation implements Operation {
    public constructor() {}

    public exec() { return true; }

    public isExecutable() { return true; }
}