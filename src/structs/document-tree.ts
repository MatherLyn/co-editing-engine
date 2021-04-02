import Segment from 'src/structs/segment';
import SplayTree from 'src/structs/splay-tree';
import ID from 'src/structs/id';
import { DEFAULT_RANGE } from 'src/structs/range';
import Edits from 'src/operations/edits';
import { Range } from 'monaco-editor';

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

    public insertBetween(prev: Segment, next: Segment, segment: Segment) {}

    public delete(segment: Segment) {
        this.splayNode(segment);
        segment.setInvisible();
    }

    public getSegmentBoundaryByRange(range: Range) {}

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
}
