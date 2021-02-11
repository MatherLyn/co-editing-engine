import { DocumentTree } from "./document-tree";
import { ID } from "./id";
import { OperationPool } from "./operation-pool";
import { Position, ZERO_POSITION } from "./position";
import { Segment } from "./segment";

export class Document {
    private documentTree: DocumentTree;
    private operationPool: OperationPool;
    public constructor(
        private localId: ID,
        text: string,
    ) {
        this.operationPool = new OperationPool();
        this.documentTree = new DocumentTree();

        if (text) {
            this.setTextInRange(ZERO_POSITION, ZERO_POSITION, text);
        }
    }

    public setTextInRange(start: Position, end: Position, content: string) {

    }
}