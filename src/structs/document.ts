import { monaco } from 'react-monaco-editor';
import Edit from 'src/operations/edit';
import ID from 'src/structs/id';
import DocumentTree from 'src/structs/document-tree';
import Segment from 'src/structs/segment';
import Range, { DEFAULT_RANGE, MAX_RANGE } from 'src/structs/range';
import Deletion from 'src/operations/deletion';

interface IDocumentOptions {
    readonly clientID: number;
    history: Edit[];
    editorModel: monaco.editor.ITextModel;
}

export default class Document {
    public readonly clientID: number;
    public history: Edit[];
    private readonly editorModel: monaco.editor.ITextModel;
    private documentTree: DocumentTree;
    private undoStack: Edit[];
    private redoStack: Edit[];
    private pendingEdits: Edit[];
    private segmentShortCut: Map<string, Segment>;
    private deletions: Map<string, Deletion>;

    public constructor(options: IDocumentOptions) {
        const { clientID, history, editorModel } = options;
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
        this.history = history;
        this.editorModel = editorModel;
        this.documentTree = new DocumentTree({ start, end });
        this.undoStack = [];
        this.redoStack = [];
        this.pendingEdits = [];
        this.segmentShortCut = new Map<string, Segment>([[startId.toString(), start], [endId.toString(), end]]);
        this.deletions = new Map();

        this.initState();
    }

    public applyLocalEdits(edits: Edit/** probably with no left/right dependencies && no type */[]) {
        edits.forEach(edit => this.applyLocalEdit(edit));
    }

    public applyLocalEdit(edit: Edit/** probably with no left/right dependencies && no type */) {
        if (!edit.type) this.setTypeOf(edit);
        
        switch (edit.type) {
            case 1/* insert */: {
                this.insert(edit.id, edit.range, edit.text, edit.leftDependency, edit.rightDependency);
                return;
            }
            case 2/* delete */: {
                this.delete(edit.id, edit.range, edit.leftDependency, edit.rightDependency);
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
                this.delete(edit.id, edit.range, edit.leftDependency, edit.rightDependency);
                this.insert(edit.id, edit.range, edit.text, edit.leftDependency, edit.rightDependency);
                return;
            }
        }
    }

    public applyRemoteEdits(edits: Edit/** must have left/right dependencies && type */[]) {
        edits.forEach(edit => this.applyRemoteEdit(edit));
    }

    public applyRemoteEdit(edit: Edit/** must have left/right dependencies && type */) {
        if (!this.canRemoteApplyEdit(edit)) return this.pendingEdits.push(edit);
        
        switch (edit.type) {
            case 1/* insert */: {
                this.insert(edit.id, edit.range, edit.text, edit.leftDependency, edit.rightDependency);
                return;
            }
            case 2/* delete */: {
                this.delete(edit.id, edit.range, edit.leftDependency, edit.rightDependency);
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
                this.delete(edit.id, edit.range, edit.leftDependency, edit.rightDependency);
                this.insert(edit.id, edit.range, edit.text, edit.leftDependency, edit.rightDependency);
                return;
            }
        }


    }

    public insert(id: ID, range: Range, text: string, leftDependency?: string, rightDependency?: string) {
        let prev: Segment;
        let next: Segment;

        //#region preprocess
        if (leftDependency && rightDependency) {
            next = this.segmentShortCut.get(rightDependency)!;
            prev = this.documentTree.getPredecessor(next) as Segment;
        } else {
            [prev, next] = this.getSegmentBoundaryByRange(range);
        }

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
        this.segmentShortCut.set(id.toString(), segment);
    }

    public delete(id: ID, range: Range, leftDependency?: string, rightDependency?: string) {
        let prev: Segment;
        let next: Segment;

        if (leftDependency && rightDependency) {
            prev = this.segmentShortCut.get(leftDependency)!;
            next = this.segmentShortCut.get(rightDependency)!;
        } else {
            [prev, next] = this.getSegmentBoundaryByRange(range);
            leftDependency = prev.id.toString();
            rightDependency = next.id.toString();
        }

        const deletion = new Deletion({ id, range, leftDependency, rightDependency });

        this.deletions.set(id.toString(), deletion);
        this.documentTree.deleteBetween(prev, next);
    }

    public undo() {}

    public redo() {}
    
    public getText() {
        let text = '';
        const segments = this.documentTree.getAllSegments();

        segments.forEach(segment => segment.isVisible && (text += segment.text));
        
        return text;
    }

    private getRangeByText(text: string, originalRange: Range) {
        const enterNumber = text.match(/\n/g)?.length || 0;
        const { startLineNumber, startColumn } = originalRange;
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

    private getSegmentBoundaryByRange(range: Range): [Segment, Segment] {
        const { startLineNumber, startColumn, endLineNumber, endColumn } = range;
        const boundary = this.documentTree.getSegmentBoundaryByRange(range);

        const leftEdge = new Range({ startLineNumber, startColumn, endLineNumber: startLineNumber, endColumn: startColumn });
        const rightEdge = new Range({ startLineNumber: endLineNumber, startColumn: endColumn, endLineNumber, endColumn });

        const leftBoundary = this.splitSegment(boundary[0], leftEdge)[0];
        const rightBoundary = this.splitSegment(boundary[1], rightEdge)[1];
        
        return [leftBoundary, rightBoundary];
    }
    
    private splitSegment(segment: Segment, offset: Range/* which is a point */) {
        if (!offset.isPoint()) throw new Error('offset is not a point');
        if (offset.isAtLeftEdgeOf(segment.range) || offset.isAtRightEdgeOf(segment.range)) return [segment, segment];

        const res = segment.split(offset, this.editorModel);
        this.documentTree.splayNode(segment);

        return res;
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

    private initState() {
        const text = this.getText();
        this.editorModel.setValue(text);

        this.checkPendingEditsRegularly(10000);
    }

    private checkPendingEditsRegularly(interval: number) {
        setInterval(this.checkPendingEdits, interval);
    }

    private checkPendingEdits = () => {
        const { length } = this.pendingEdits;

        for (let i = length - 1; i >= 0; i--) {
            const edit = this.pendingEdits[i];

            this.applyRemoteEdit(edit);
        }
    }

    private canRemoteApplyEdit(edit: Edit) {
        switch (edit.type) {
            case 1/* insert */: 
            case 2/* delete */: {
                const hasLeftAndRightDependencies = (
                    this.segmentShortCut.has(edit.leftDependency) &&
                    this.segmentShortCut.has(edit.rightDependency)
                );

                if (hasLeftAndRightDependencies) return true;
                return false;
            }
            case 3/* undo */: {
                // not support now
                return false;
            };
            case 4/* redo */: {
                // not support now
                return false;
            }
        }
    }
}