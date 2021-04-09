import ID from 'src/structs/id';
import Range from 'src/structs/range';
import Operation from './operation';

interface ISpliceOptions {
    id: ID;
    deleteRange: Range;
    insertRange: Range;
    deleteNodes: Array<string>;
    text: string;
    leftDependency: string;
    leftOffset?: Range;
    rightDependency: string;
    rightOffset?: Range;
}

export default class Splice extends Operation {
    public readonly deleteNodes: Array<string>;
    public readonly text: string;

    public constructor(options: ISpliceOptions) {
        super(options);

        const { deleteNodes, text } = options;
        
        this.deleteNodes = deleteNodes;
        this.text = text;
        this.type = 5;
    }
}