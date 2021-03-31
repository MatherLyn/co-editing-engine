import ID from 'src/structs/id';
import Range from 'src/structs/range';
import { INode } from 'src/structs/splay-tree';

interface ISegmentOptions {
    readonly id: ID;
    readonly range: Range;
    readonly text: string;
    readonly nextSegment: Segment | null;
    readonly deletions: Set<number>;
}

export default class Segment implements INode {
    public readonly id: ID;
    public readonly range: Range;
    public readonly text: string;
    public readonly nextSegment: Segment | null;
    public readonly deletions: Set<number>;

    public constructor(options: ISegmentOptions) {
        const { id, range, text, nextSegment, deletions } = options;
        this.id = id;
        this.range = range;
        this.text = text;
        this.nextSegment = nextSegment;
        this.deletions = deletions;
    }

    public split() {}
}