import ID from 'src/structs/id';
import Range from 'src/structs/range';

interface IDeletionOptions {
    id: ID;
    range: Range;
    leftDependency: string;
    rightDependency: string;
}

export default class Deletion {
    public readonly id: ID;
    public readonly range: Range;
    public readonly leftDependency: string;
    public readonly rightDependency: string;
    public constructor(options: IDeletionOptions) {
        const { id, range, leftDependency, rightDependency } = options;
        this.id = id;
        this.range = range;
        this.leftDependency = leftDependency;
        this.rightDependency = rightDependency;
    }
}