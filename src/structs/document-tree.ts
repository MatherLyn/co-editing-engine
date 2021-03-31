import Segment from 'src/structs/segment';
import SplayTree from 'src/structs/splay-tree';
import ID from 'src/structs/id';
import { DEFAULT_RANGE } from 'src/structs/range';

interface IDocumentTreeOptions {
    clientID: number;
}

export default class DocumentTree extends SplayTree {
    public constructor(options: IDocumentTreeOptions) {
        super();

        const { clientID } = options;
        const id = new ID({
            clientID,
            vectorClock: 0,
        });

        this.root = new Segment({
            id,
            range: DEFAULT_RANGE,
            text: '',
            nextSegment: null,
            deletions: new Set(),
        });
    }

    public getTextValue() {}
}
