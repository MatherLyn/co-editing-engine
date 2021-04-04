import Segment from 'src/structs/segment';
import SplayTree from 'src/structs/splay-tree';
import ID from 'src/structs/id';
import { DEFAULT_RANGE } from 'src/structs/range';
import Range from 'src/structs/range';

interface IDocumentTreeOptions {
    start: Segment;
    end: Segment;
}

export default class DocumentTree extends SplayTree {
    protected root: Segment;
    protected EOF: Segment;
    private documentEntry: Segment;
    public constructor(options: IDocumentTreeOptions) {
        super();

        const { start, end } = options;

        this.root = start;
        this.EOF = end;
        this.root.next = this.EOF;
        this.EOF.parent = this.root;
        this.documentEntry = this.root;
    }

    public insertBetween(prev: Segment, next: Segment, segment: Segment) {
        this.splayNode(prev);
        this.splayNode(next);
        this.root = segment;
        segment.prev = prev;
        prev.parent = segment;
        segment.next = next;
        next.parent = segment;
        next.prev = null;
        this.updateSubtreeRange(next);
        this.updateSubtreeExtent(next);
        this.updateSubtreeExtent(segment);
    }

    public deleteBetween(prev: Segment, next: Segment) {
        let iterator: Segment = prev;
        while (iterator.next !== null && iterator.next !== next) {
            iterator.setInvisible();
            iterator = iterator.next;
        }

        this.updateSubtreeExtent(prev);
        this.updateSubtreeExtent(next);
    }

    public getAllSegments() {
        const res: Segment[] = [];
        
        this.preOrderVisit(this.root, node => res.push(node));
        
        return res;
    }

    public getSegmentBoundaryByRange(range: Range): [Segment, Segment] {
        const { root } = this;

        if (range.equals(root.subTreeRange)) return [this.documentEntry, this.getTheLastSegment()];

        if (range.isIn(root.range)) {
            if (range.isAtLeftEdgeOf(root.range)) return [root.prev || this.documentEntry, root];

            if (range.isAtRightEdgeOf(root.range)) return [root, root.next || this.EOF];

            return [root, root];
        }
        
        const { startLineNumber, startColumn, endLineNumber, endColumn } = range;

        const leftBoundary = this.getSegmentContainingPoint(startLineNumber, startColumn, this.root);
        const rightBoundary = this.getSegmentContainingPoint(endLineNumber, endColumn, this.root);

        return [leftBoundary, rightBoundary];
    }

    protected updateSubtreeExtent(root: Segment | null) {
        root?.updateSubTreeRange();
    }

    private updateSubtreeRange(root/** must be the right child */: Segment) {
        const { range } = root;
        const parentRange = root.parent!.range;
        const diffLineNumber = parentRange.endLineNumber - range.startLineNumber;
        const diffColumn = parentRange.endColumn - range.startColumn;
        const queue: Segment[] = [];

        this.preOrderVisit(root, node => { queue.push(node) });

        queue.forEach(segment => {
            const diff = {
                lineNumber: diffLineNumber,
                column: segment === root ? diffColumn : 0,
            };
            segment.range = segment.range.getMoved(diff);
        });
    }
    
    private preOrderVisit(node: Segment, func: (node: Segment) => void): void {
        if (node.prev) this.preOrderVisit(node.prev, func);
        func(node);
        if (node.next) this.preOrderVisit(node.next, func);
    }

    private getSegmentContainingPoint(lineNumber: number, column: number, root: Segment): Segment {
        if (Range.pointIsInRange(lineNumber, column, root.range)) return root;

        if (Range.pointIsBeforeRange(lineNumber, column, root.range)) {
            if (root.prev) return this.getSegmentContainingPoint(lineNumber, column, root.prev);

            throw new Error('no segment found');
        }

        if (Range.pointIsAfterRange(lineNumber, column, root.range)) {
            if (root.next) return this.getSegmentContainingPoint(lineNumber, column, root.next);
            
            throw new Error('no segment found');
        }

        throw new Error('no segment found');
    }

    private getTheLastSegment() {
        return this.EOF;
    }
}
