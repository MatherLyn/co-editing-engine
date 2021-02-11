import { Operation } from "src/operations/operation";

export class OperationPool {
    private pool: Operation[] = [];

    public append(incomingOperation: Operation) {
        this.pool.push(incomingOperation);
    }

    public clear() {
        const tempPool: Operation[] = [];
        this.pool.forEach((operation: Operation, index: number) => {
            if (operation.exec()) {
                return;
            }

            tempPool.push(operation);
        });

        this.pool = tempPool;
    }
}