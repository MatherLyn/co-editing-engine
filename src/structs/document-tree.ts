import Segment from 'src/structs/segment';
import SplayTree from 'src/structs/splay-tree';
import ID from 'src/structs/id';
import { DEFAULT_RANGE } from 'src/structs/range';
import Edits from 'src/operations/edits';
import Range from 'src/structs/range';
import { rand } from 'lib0/random';

interface IDocumentTreeOptions {
    segment: Segment
}

export default class DocumentTree extends SplayTree {
    protected root: Segment;
    private documentEntry: Segment;
    public constructor(options: IDocumentTreeOptions) {
        super();

        const { segment } = options;

        this.root = segment;
        this.documentEntry = this.root;
    }

    public insertBetween(prev: Segment, next: Segment, segment: Segment) {
        
    }

    public delete(segment: Segment) {
        this.splayNode(segment);
        segment.setInvisible();
    }

    public getAllSegments() {
        let iterator: Segment = this.documentEntry;
        const res = [];
        
        do {
            do {
                res.push(iterator);
            } while (iterator.nextSplit !== null && (iterator = iterator.nextSplit))
        } while (iterator.next !== null && (iterator = iterator.next))
        
        return res;
    }

    public getSegmentBoundaryByRange(range: Range): [Segment, Segment] {
        const { root } = this;

        if (range.isIn(root.range)) return [root, root];

        if (!range.isIn(root.subTreeRange)) throw new Error('no segment found');

        if (range.equals(root.subTreeRange)) return [this.documentEntry, this.getTheLastSegment()];
        
        const { startLineNumber, startColumn, endLineNumber, endColumn } = range;

        const leftBoundary = this.getSegmentContainingPoint(startLineNumber, startColumn, this.root);
        const rightBoundary = this.getSegmentContainingPoint(endLineNumber, endColumn, this.root);

        return [leftBoundary, rightBoundary];
    }

    private getSegmentContainingPoint(lineNumber: number, column: number, root: Segment): Segment {
        if (Range.pointIsInRange(lineNumber, column, root.range)) return root;

        if (Range.pointIsBeforeRange(lineNumber, column, root.range)) {
            if (root.prev) return this.getSegmentContainingPoint(lineNumber, column, root.prev);

            throw new Error('no seegment found');
        }

        if (Range.pointIsAfterRange(lineNumber, column, root.range)) {
            if (root.next) return this.getSegmentContainingPoint(lineNumber, column, root.next);
            
            throw new Error('no seegment found');
        }

        throw new Error('no seegment found');
    }

    private getTheLastSegment() {
        let iterator = this.root;

        while (iterator.next !== null) iterator = iterator.next;

        return iterator;
    }
}
