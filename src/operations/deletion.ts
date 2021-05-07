import ID from 'src/structs/id';
import Range from 'src/structs/range';
import Operation from './operation';

interface IDeletionOptions {
    id: ID;
    range?: Range;
    deleteNodes: IDeleteNode[];
    leftDependency: string;
    leftOffset?: Range;
    rightDependency: string;
    rightOffset?: Range;
}

export interface IDeleteNode {
    id: ID;
    offset?: Range;
}

export default class Deletion extends Operation {
    public readonly range?: Range;
    public readonly deleteNodes: IDeleteNode[];

    public constructor(options: IDeletionOptions) {
        super(options);

        const { range, deleteNodes } = options;

        this.range = range;
        this.deleteNodes = deleteNodes;
        this.type = 2;
    }
}