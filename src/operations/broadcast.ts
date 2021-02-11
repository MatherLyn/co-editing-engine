import { ID } from "src/structs/id";
import { Operation } from "./operation";

export class BroadcastOperation implements Operation {
    public constructor() {}

    public exec(otherClients: ID[]) {
        otherClients.forEach((id: ID) => {
            const site = id.site;
            // network job
        });

        return true;
    }

    public isExecutable() {
        return true;
    }
}