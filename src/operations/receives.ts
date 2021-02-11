import { Operation } from "./operation";

export class ReceiveOperation implements Operation {
    public constructor() {}

    public exec() { return true; }

    public isExecutable() { return true; }
}