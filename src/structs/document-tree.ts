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
        this.updateRange(next);
        this.updateSubTreeRange(segment);
    }

    public deleteBetween(prev: Segment, next: Segment) {
        let iterator: Segment = this.getSuccessor(prev) as Segment;
        
        while (iterator !== this.EOF && iterator !== next) {
            iterator.setInvisible();
            iterator.updateSubTreeRange();
            iterator = this.getSuccessor(iterator) as Segment;
        }

        this.updateRange(next);
        this.updateSubTreeRange(next);
    }

    public getAllSegments() {
        const res: Segment[] = [];
        
        this.preOrderVisit(this.root, node => res.push(node));
        
        return res;
    }

    public getSegmentBoundaryByRange(range: Range): [Segment, Segment] {
        const { root } = this;

        if (range.equals(root.subTreeRange)) return [this.documentEntry, this.EOF];
        
        const { startLineNumber, startColumn, endLineNumber, endColumn } = range;

        const leftContainer = this.getSegmentContainingPoint(startLineNumber, startColumn, this.root);
        const rightContainer = this.getSegmentContainingPoint(endLineNumber, endColumn, this.root);

        let leftBoundary: Segment = leftContainer;
        let rightBoundary: Segment = rightContainer;

        if (range.isAtLeftEdgeOf(leftContainer.range)) leftBoundary = this.getPredecessor(leftContainer) as Segment | null || this.documentEntry;
        if (range.isAtRightEdgeOf(rightContainer.range)) rightBoundary = this.getSuccessor(rightContainer) as Segment | null || this.EOF;

        return [leftBoundary, rightBoundary];
    }

    protected updateSubTreeRange(node: Segment) {
        node.updateSubTreeRange();
    }

    protected updateRange(node/** must be the right child */: Segment) {
        // only updates the right subtree of the node
        node.updateRange();
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
}
