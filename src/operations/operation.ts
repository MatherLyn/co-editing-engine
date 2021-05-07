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
    public readonly id: ID;
    public readonly leftDependency: string;
    public readonly leftOffset?: Range;
    public readonly rightDependency: string;
    public readonly rightOffset?: Range;
    public type: /* Error */ 0 | /* Insertion */ 1 | /* Deletion */ 2 | /* Undo */ 3 | /* Redo */ 4 | /* Splice */ 5;

    public static deserialize(serializedString: string) {
        const rawOperations = JSON.parse(serializedString);
        rawOperations.id = new ID(rawOperations.id);
        if (rawOperations.leftOffset) rawOperations.leftOffset = new Range(rawOperations.leftOffset);
        if (rawOperations.rightOffset) rawOperations.rightOffset = new Range(rawOperations.rightOffset);

        return rawOperations as Operation;
    }

    public constructor(options: IOperationOptions) {
        const { id, leftDependency, leftOffset, rightDependency, rightOffset } = options;
        this.id = id;
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