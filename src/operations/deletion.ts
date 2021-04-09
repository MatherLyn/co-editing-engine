import ID from 'src/structs/id';
import Range from 'src/structs/range';
import Operation from './operation';

interface IDeletionOptions {
    id: ID;
    range: Range;
    deleteNodes: Array<string>;
    leftDependency: string;
    leftOffset?: Range;
    rightDependency: string;
    rightOffset?: Range;
}

export default class Deletion extends Operation {
    public readonly range: Range;
    public readonly deleteNodes: Array<string>;

    public constructor(options: IDeletionOptions) {
        super(options);

        const { range, deleteNodes } = options;

        this.range = range;
        this.deleteNodes = deleteNodes;
        this.type = 2;
    }
}