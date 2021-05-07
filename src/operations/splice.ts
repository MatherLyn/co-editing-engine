import ID from 'src/structs/id';
import Range from 'src/structs/range';
import { IDeleteNode } from './deletion';
import Operation from './operation';

interface ISpliceOptions {
    id: ID;
    deleteRange: Range;
    insertRange: Range;
    deleteNodes: IDeleteNode[];
    text: string;
    leftDependency: string;
    leftOffset?: Range;
    rightDependency: string;
    rightOffset?: Range;
}

export default class Splice extends Operation {
    public readonly deleteNodes: IDeleteNode[];
    public readonly text: string;

    public constructor(options: ISpliceOptions) {
        super(options);

        const { deleteNodes, text } = options;
        
        this.deleteNodes = deleteNodes;
        this.text = text;
        this.type = 5;
    }
}