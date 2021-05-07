import ID from 'src/structs/id';
import Range from 'src/structs/range';

interface IOperationOptions {
    id: ID;
    leftDependency: string;
    leftOffset?: Range;
    rightDependency: string;
    rightOffset?: Range;
}

export default class Operation {
    public readonly clientID: number;
    public readonly vectorClock: number;
    public readonly leftDependency: string;
    public readonly leftOffset?: Range;
    public readonly rightDependency: string;
    public readonly rightOffset?: Range;
    public type: /* Error */ 0 | /* Insertion */ 1 | /* Deletion */ 2 | /* Undo */ 3 | /* Redo */ 4 | /* Splice */ 5;

    public constructor(options: IOperationOptions) {
        const { id, leftDependency, leftOffset, rightDependency, rightOffset } = options;
        this.clientID = id.clientID;
        this.vectorClock = id.vectorClock;
        this.leftDependency = leftDependency;
        this.leftOffset = leftOffset;
        this.rightDependency = rightDependency;
        this.rightOffset = rightOffset;
        this.type = 0;
    }

    public serialize() {
        return JSON.stringify(this);
    }
}