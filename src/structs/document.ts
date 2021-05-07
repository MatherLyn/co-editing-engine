import { monaco } from 'react-monaco-editor';
import Edit from 'src/operations/edit';
import ID from 'src/structs/id';
import DocumentTree from 'src/structs/document-tree';
import Segment from 'src/structs/segment';
import Range, { DEFAULT_RANGE } from 'src/structs/range';
import Deletion from 'src/operations/deletion';
import Insertion from 'src/operations/insertion';
import Operation from 'src/operations/operation';
import Splice from 'src/operations/splice';

interface IDocumentOptions {
    readonly clientID: number;
    editorModel: monaco.editor.ITextModel;
}

export default class Document {
    public clientID: number;
    private readonly editorModel: monaco.editor.ITextModel;
    private documentTree: DocumentTree;
    private pendingOperation: Operation[];
    private segmentShortCut: Map<string, Segment>;

    public constructor(options: IDocumentOptions) {
        const { clientID, editorModel } = options;
        const startId = new ID({
            clientID,
            vectorClock: -1,
        });
        const endId = new ID({
            clientID,
            vectorClock: 0,
        });
        const start = new Segment({
            id: startId,
            range: DEFAULT_RANGE,
            text: '',
            isVisible: true,
            parent: null,
            prev: null,
            next: null,
            nextSplit: null,
        });
        const end = new Segment({
            id: endId,
            range: DEFAULT_RANGE,
            text: '',
            isVisible: true,
            parent: null,
            prev: null,
            next: null,
            nextSplit: null,
        });

        this.clientID = clientID;
        this.editorModel = editorModel;
        this.documentTree = new DocumentTree({ start, end });
        this.pendingOperation = [];
        this.segmentShortCut = new Map<string, Segment>([[start.id.toString(), start], [end.id.toString(), end]]);

        this.initState();
    }

    public setClientID(clientID: number) {
        this.clientID = clientID;
    }

    //#region local edits
    public applyLocalEdits(edits: Edit[]) {
        edits.forEach(edit => this.applyLocalEdit(edit));
    }

    public applyLocalEdit(edit: Edit) {
        if (!edit.type) this.setTypeOf(edit);
        
        switch (edit.type) {
            case 1/* insert */: {
                const insertion = this.insert(edit.id, edit.range, edit.text);
                console.log(this.getText());
                return insertion;
            }
            case 2/* delete */: {
                const deletion = this.delete(edit.id, edit.range);
                console.log(this.getText());
                return deletion;
            }
            case 3/* undo */: {
                // not support now
                return;
            }
            case 4/* redo */: {
                // not support now
                return;
            }
            case 5/* splice */: {
                const splice = this.splice(edit.id, edit.range, edit.text);
                console.log(this.getText());
                return splice;
            }
        }
    }

    public insert(id: ID, range: Range, text: string) {
        const [prev, next] = this.getSegmentBoundaryByRange(range);
        const newRange = this.getRangeByText(text, range);

        const segment = new Segment({
            id,
            range: newRange,
            text,
            parent: null,
            prev: null,
            next: null,
            nextSplit: null,
        });

        this.documentTree.insertBetween(prev, next, segment);
        this.segmentShortCut.set(segment.id.toString(), segment);

        return new Insertion({
            id,
            text,
            leftDependency: prev.id.toString(),
            leftOffset: prev.offset,
            rightDependency: next.id.toString(),
            rightOffset: next.offset,
        });
    }

    public delete(id: ID, range: Range) {
        const [prev, next] = this.getSegmentBoundaryByRange(range);
        const deleteNodes = this.documentTree.deleteBetween(prev, next);

        return new Deletion({
            id,
            range,
            leftDependency: prev.id.toString(),
            leftOffset: prev.offset,
            rightDependency: next.id.toString(),
            rightOffset: next.offset,
            deleteNodes,
        });
    }

    public splice(id: ID, range: Range, text: string) {
        const deletion = this.delete(id, range);
        const { startLineNumber, startColumn } = deletion.range!;
        const newRange = new Range({
            startLineNumber,
            startColumn,
            endLineNumber: startLineNumber,
            endColumn: startColumn,
        });
        const insertion = this.insert(id, newRange, text);

        return new Splice({
            id: id,
            deleteRange: range,
            insertRange: newRange,
            deleteNodes: deletion.deleteNodes,
            text: insertion.text,
            leftDependency: deletion.leftDependency,
            rightDependency: deletion.rightDependency,
        });
    }

    public undo() {}

    public redo() {}
    //#endregion

    //#region remote operations
    public integrateRemoteOperations(operations: Operation[]) {
        operations.forEach(operation => this.integrateRemoteOperation(operation));
    }

    public integrateRemoteOperation(operation: Operation) {
        if (!this.canRemoteOperationBeIntegrated(operation)) return this.pendingOperation.push(operation);
        
        switch (operation.type) {
            case 1/* insert */: {
                this.integrateInsertion(operation as Insertion);
                return;
            }
            case 2/* delete */: {
                this.integrateDeletion(operation as Deletion);
                return;
            }
            case 3/* undo */: {
                // not support now
                return;
            }
            case 4/* redo */: {
                // not support now
                return;
            }
            case 5/* splice */: {
                this.integrateSplice(operation as Splice);
                return;
            }
        }
    }
    
    private integrateInsertion(insertion: Insertion) {
        const { id, text, leftDependency, leftOffset, rightDependency, rightOffset } = insertion;
        const [leftBoundary, rightBoundary] = this.getRemoteOperationSegmentBoundary(leftDependency, rightDependency, leftOffset, rightOffset);
        const [prev, next] = this.documentTree.getRemoteInsertionDependencies(id, leftBoundary, rightBoundary);

        const { endLineNumber, endColumn } = prev.range;
        const startPoint = new Range({
            startLineNumber: endLineNumber,
            startColumn: endColumn,
            endLineNumber,
            endColumn,
        });
        const range = this.getRangeByText(text, startPoint);

        const segment = new Segment({
            id,
            range,
            text,
            parent: null,
            prev,
            next,
            nextSplit: null,
        });

        this.documentTree.insertBetween(prev, next, segment);
        this.segmentShortCut.set(segment.id.toString(), segment);
    }

    private integrateDeletion(deletion: Deletion) {
        const { id, leftDependency, leftOffset, rightDependency, rightOffset, deleteNodes } = deletion;
        const [prev, next] = this.getRemoteOperationSegmentBoundary(leftDependency, rightDependency, leftOffset, rightOffset);
        const segmentsToDelete: Segment[] = [];

        deleteNodes.forEach(deleteNode => {
            if (!deleteNode.offset) return;

            const id = new ID(deleteNode.id);
            const offset = new Range(deleteNode.offset);
            const segment = this.segmentShortCut.get(id.toString())!;
            const [, segmentToDelete] = this.splitSegment(segment, offset);
            segmentsToDelete.push(segmentToDelete);
        });

        this.documentTree.deleteBetween(prev, next, segmentsToDelete);
    }

    private integrateSplice(splice: Splice) {
        const { id, text, deleteNodes, leftDependency, leftOffset, rightDependency, rightOffset } = splice;
        const deletion = new Deletion({
            id,
            deleteNodes,
            leftDependency,
            leftOffset,
            rightDependency,
            rightOffset,
        });
        const insertion = new Insertion({
            id,
            text,
            leftDependency,
            leftOffset,
            rightDependency,
            rightOffset,
        });

        this.integrateDeletion(deletion);
        this.integrateInsertion(insertion);
    }
    //#endregion

    public getText() {
        let text = '';
        const segments = this.documentTree.getAllSegments();

        segments.forEach(segment => segment.isVisible && (text += segment.text));
        
        return text;
    }

    private initState() {
        const text = this.getText();
        this.editorModel.setValue(text);

        this.checkpendingOperationRegularly(10000);
    }

    private getRangeByText(text: string, startPoint/* point */: Range) {
        const enterNumber = text.match(/\n/g)?.length || 0;
        const { startLineNumber, startColumn } = startPoint;
        const endLineNumber = startLineNumber + enterNumber;
        let endColumn: number;

        if (enterNumber) {
            const lastIndexOfEnter = text.lastIndexOf('\n');
            endColumn = text.substring(lastIndexOfEnter + 1).length + 1;
        } else {
            endColumn = startColumn + text.length;
        }
        
        return new Range({ startLineNumber, startColumn, endLineNumber, endColumn });
    }

    private getRemoteOperationSegmentBoundary(
        leftDependency: string,
        rightDependency: string,
        leftOffset?: Range,
        rightOffset?: Range,
    ) {
        let left = this.segmentShortCut.get(leftDependency)!;
        let right = this.segmentShortCut.get(rightDependency)!;

        if (leftOffset) [left] = this.splitSegment(left, leftOffset);
        if (rightOffset) [, right] = this.splitSegment(right, rightOffset);

        return [left, right];
    }

    private getSegmentBoundaryByRange(range: Range): [Segment, Segment] {
        const { startLineNumber, startColumn, endLineNumber, endColumn } = range;
        const boundary = this.documentTree.getSegmentBoundaryByRange(range);

        if (boundary[0] === boundary[1] && range.isPoint()) {
            const offset = this.getOffset(boundary[0], startLineNumber, startColumn);
            return this.splitSegment(boundary[0], offset);
        }

        const leftOffset = this.getOffset(boundary[0], startLineNumber, startColumn);
        const rightOffset = this.getOffset(boundary[1], endLineNumber, endColumn);

        const leftBoundary = this.splitSegment(boundary[0], leftOffset)[0];
        const rightBoundary = this.splitSegment(boundary[1], rightOffset)[1];
        
        return [leftBoundary, rightBoundary];
    }

    private getOffset(segment: Segment, lineNumber: number, column: number) {
        let offsetLineNumber = lineNumber;
        let offsetColumn = column;
        if (segment.range.startLineNumber === lineNumber) {
            offsetLineNumber = lineNumber - segment.range.startLineNumber + segment.offset.startLineNumber;
            offsetColumn = column - segment.range.startColumn + segment.offset.startColumn;
        }

        return new Range({
            startLineNumber: offsetLineNumber,
            startColumn: offsetColumn,
            endLineNumber: offsetLineNumber,
            endColumn: offsetColumn,
        });
    }

    private splitSegment(segment: Segment, offset: Range/* must be a point */): [Segment, Segment] {
        if (!offset.isPoint()) throw new Error('offset is not a point');
        if (offset.isAtLeftEdgeOf(segment.offset)) return [segment, segment];
        const segmentEndOffset = this.getRangeByText(segment.text, segment.offset);
        if (offset.isAtRightEdgeOf(segmentEndOffset)) return [segment, segment.nextSplit || segment];

        let iterator: Segment = segment;
        while (iterator.nextSplit?.id.equals(segment.id) && iterator.nextSplit.offset.isBefore(offset)) {
            iterator = iterator.nextSplit;

            if (offset.isAtLeftEdgeOf(iterator.offset)) return [iterator, iterator];
        }

        return this.documentTree.splitSegment(iterator, offset);
    }

    private setLeftAndRightDependenciesOf(edit: Edit) {
        const [prev, next] = this.getSegmentBoundaryByRange(edit.range);

        return edit.setDependencies(prev.id.toString(), next.id.toString());
    }

    private setTypeOf(edit: Edit) {
        const { range, text } = edit;
        if (text && !range.isPoint()) return edit.setType(5);
        if (edit.text.length === 0) return edit.setType(2);
        
        edit.setType(1);
    }

    private checkpendingOperationRegularly(interval: number) {
        setInterval(this.checkpendingOperation, interval);
    }

    private checkpendingOperation = () => {
        const { length } = this.pendingOperation;

        for (let i = length - 1; i >= 0; i--) {
            const operation = this.pendingOperation[i];

            this.integrateRemoteOperation(operation);
        }
    }

    private canRemoteOperationBeIntegrated(operation: Operation) {
        switch (operation.type) {
            case 1/* insert */: {
                const hasLeftAndRightDependencies = (
                    this.segmentShortCut.has(operation.leftDependency) &&
                    this.segmentShortCut.has(operation.rightDependency)
                );

                if (hasLeftAndRightDependencies) return true;
                return false;
            }
            case 2/* delete */: {
                const { deleteNodes } = (operation as Deletion);

                for (let i = 0; i < deleteNodes.length; i++) {
                    const deleteNode = deleteNodes[i];
                    // if (!this.segmentShortCut.has(deleteNode)) return false;
                }

                return true;
            }
            case 3/* undo */: {
                // not support now
                return false;
            };
            case 4/* redo */: {
                // not support now
                return false;
            }
            case 5:/* splice */ {
                const hasLeftAndRightDependencies = (
                    this.segmentShortCut.has(operation.leftDependency) &&
                    this.segmentShortCut.has(operation.rightDependency)
                );

                if (!hasLeftAndRightDependencies) return false;

                const { deleteNodes } = (operation as Deletion);

                for (let i = 0; i < deleteNodes.length; i++) {
                    const deleteNode = deleteNodes[i];
                    // if (!this.segmentShortCut.has(deleteNode)) return false;
                }

                return true;
            }
        }

        return false;
    }    
}