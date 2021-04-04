import { monaco } from 'react-monaco-editor';
import Edit from 'src/operations/edit';
import ID from 'src/structs/id';
import DocumentTree from 'src/structs/document-tree';
import Segment from 'src/structs/segment';
import Range, { DEFAULT_RANGE, MAX_RANGE } from 'src/structs/range';

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
            range: MAX_RANGE,
            text: '',
            isVisible: false,
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

        this.initState();
    }

    public applyLocalEdits(edits: Edit/** probably with no left/right dependencies && no type */[]) {
        edits.forEach(edit => this.applyLocalEdit(edit));
    }

    public applyLocalEdit(edit: Edit/** probably with no left/right dependencies && no type */) {
        if (!edit.leftDependency || !edit.rightDependency) this.setLeftAndRightDependenciesOf(edit);
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
            };
            case 4/* redo */: {
                // not support now
                return;
            }
        }
    }

    public applyRemoteEdits(edits: Edit/** must have left/right dependencies && type */[]) {
        edits.forEach(edit => this.applyRemoteEdit(edit));
    }

    public applyRemoteEdit(edit: Edit/** must have left/right dependencies && type */) {
        if (!this.canRemoteApplyEdit(edit)) return this.pendingEdits.push(edit);


    }

    public insert(id: ID, range: Range, text: string, leftDependency?: string, rightDependency?: string) {
        const { endLineNumber, endColumn } = range;
        let prev: Segment;
        let next: Segment;
        let newRange: Range;

        if (leftDependency && rightDependency) {
            prev = this.segmentShortCut.get(leftDependency)!;
            next = this.segmentShortCut.get(rightDependency)!;
        } else {
            [prev, next] = this.getSegmentBoundaryByRange(range);
        }

        // special condition: input 'Enter' at the end of the line
        if (range.isPoint()) {
            const isEnter = /\n/.test(text);
            const newEndLineNumber: number = isEnter ? (endLineNumber + 1) : endLineNumber;
            const newEndColumn: number = isEnter ? 1 : endColumn + text.length;

            newRange = new Range({
                ...range,
                endLineNumber: newEndLineNumber,
                endColumn: newEndColumn,
            });
        } else {
            newRange = new Range({ ...range });
        }

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
        }

        this.documentTree.deleteBetween(prev, next);
    }

    public undo() {}

    public redo() {}
    
    public getText() {
        let text = '';
        const segments = this.documentTree.getAllSegments();

        segments.forEach((segment: Segment) => text += segment.text);
        
        return text;
    }

    private getSegmentBoundaryByRange(range: Range): [Segment, Segment] {
        let res = this.documentTree.getSegmentBoundaryByRange(range);

        if (res[0] === res[1]) res = this.splitSegment(res[0], range);

        return res;
    }
    
    private splitSegment(segment: Segment, offset: Range) {
        const res = segment.split(offset, this.editorModel);
        this.documentTree.splayNode(segment);

        return res;
    }

    private setLeftAndRightDependenciesOf(edit: Edit) {
        const [prev, next] = this.getSegmentBoundaryByRange(edit.range);

        return edit.setDependencies(prev.id.toString(), next.id.toString());
    }

    private setTypeOf(edit: Edit) {
        return edit.setType(1);
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