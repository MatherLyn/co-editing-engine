import Segment from 'src/structs/segment';
import SplayTree from 'src/structs/splay-tree';
import ID from 'src/structs/id';
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

    public getAllSegments(): Segment[] {
        const res: Segment[] = [];
        
        this.preOrderVisit(this.root, node => res.push(node));
        
        return res;
    }

    public insertBetween(prev: Segment, next: Segment, segment: Segment): void {
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

    public deleteBetween(prev: Segment, next: Segment): Set<string> {
        let iterator = this.getSuccessor(prev) as Segment;
        const deleteNodes: Set<string> = new Set();
        
        while (iterator !== this.EOF && iterator !== next) {
            iterator.setInvisible();
            deleteNodes.add(iterator.id.toString());
            iterator = this.getSuccessor(iterator) as Segment;
        }

        this.updateRange(next);
        this.updateSubTreeRange(prev);
        this.updateSubTreeRange(next);

        return deleteNodes;
    }

    public getRemoteInsertionDependencies(id: ID, left: Segment, right: Segment, leftOffset?: Range, rightOffset?: Range): [Segment, Segment] {
        let slowIterator: Segment = left;
        let fastIterator: Segment = this.getSuccessor(slowIterator) as Segment;

        // if (leftOffset) while(slowIterator.offset !== leftOffset) slowIterator = slowIterator.nextSplit!;
        // if (rightOffset) while(fastIterator.offset !== rightOffset) fastIterator = fastIterator.nextSplit!;

        while (fastIterator !== this.EOF && fastIterator !== right) {
            if (id.isSmallerThan(fastIterator.id)) break;

            slowIterator = fastIterator;
            fastIterator = this.getSuccessor(slowIterator) as Segment;
        }

        return [slowIterator, fastIterator];
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

    public splitSegment(segment: Segment, offset: Range/* must be a point */): [Segment, Segment] {
        const res = segment.split(offset);
        const [prefix, suffix] = res;

        this.splayNode(prefix);

        prefix.next && (prefix.next.parent = suffix);
        suffix.next = prefix.next;
        suffix.parent = prefix;
        prefix.next = suffix;
        prefix.nextSplit = suffix;

        this.updateRange(prefix);
        this.updateSubTreeRange(prefix);

        return res;
    }

    protected updateSubTreeRange(node: Segment) {
        node.subTreeRange = node.calcSubTreeRange;
    }

    protected updateRange(node/** must be the right child */: Segment) {
        // only updates the right subtree of the node
        const predessor = this.getPredecessor(node) as Segment | null;
        if (!predessor) return node.range;

        const { text } = node;
        const enterNumber = text.match(/\n/g)?.length || 0;
        const { endLineNumber, endColumn } = predessor.range;
        const newStartLineNumber = endLineNumber;
        const newStartColumn = endColumn;
        const newEndLineNumber = node.isVisible ? newStartLineNumber + enterNumber : newStartLineNumber;
        let newEndColumn: number;

        if (node.isVisible) {
            if (enterNumber) {
                const lastIndexOfEnter = text.lastIndexOf('\n');
                newEndColumn = text.substring(lastIndexOfEnter + 1).length + 1;
            } else {
                newEndColumn = newStartColumn + text.length;
            }
        } else {
            newEndColumn = newStartColumn;
        }
        
        node.range = new Range({
            startLineNumber: newStartLineNumber,
            startColumn: newStartColumn,
            endLineNumber: newEndLineNumber,
            endColumn: newEndColumn
        });
        
        const successor = this.getSuccessor(node) as Segment | null;
        if (successor) this.updateRange(successor);
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
