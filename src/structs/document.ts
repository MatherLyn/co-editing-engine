import { monaco } from 'react-monaco-editor';
import Edit from 'src/operations/edit';
import Edits from 'src/operations/edits';
import ID from 'src/structs/id';
import DocumentTree from 'src/structs/document-tree';
import Segment from 'src/structs/segment';
import Range, { DEFAULT_RANGE } from 'src/structs/range';

interface IDocumentOptions {
    readonly clientID: number;
    history: Edits[];
    editorModel: monaco.editor.ITextModel;
}

export default class Document {
    public readonly clientID: number;
    public history: Edits[];
    private readonly editorModel: monaco.editor.ITextModel;
    private documentTree: DocumentTree;
    private undoStack: Edits[];
    private redoStack: Edits[];
    private pendingOperations: Edits[];
    private segmentShortCut: Map<string, Segment>;

    public constructor(options: IDocumentOptions) {
        const { clientID, history, editorModel } = options;
        const id = new ID({
            clientID,
            vectorClock: 0,
        });
        const rootSegment = new Segment({
            id,
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
        this.documentTree = new DocumentTree({ segment: rootSegment });
        this.undoStack = [];
        this.redoStack = [];
        this.pendingOperations = [];
        this.segmentShortCut = new Map<string, Segment>([[id.toString(), rootSegment]]);

        this.initState();
    }

    public integrateOperations(operations: Edits[]) {
        // 'operations' means edits array collected from different peers
        operations.forEach(edits => this.integrateEditsFromSinglePeer(edits));
    }

    public integrateEditsFromSinglePeer(edits: Edits) {
        if (!this.canIntegrateEditsFromSinglePeer(edits)) {
            return this.pendingOperations.push(edits);
        }

        const { editArray, id } = edits;

        editArray.forEach(edit => {
            switch (edit.type) {
                case 1/* insert */: {
                    this.insert(edit, id);
                    return;
                }
                case 2/* delete */: {
                    this.delete(edit, id);
                    return;
                }
                case 3/* undo */: {
                    this.undo();
                    return;
                }
                case 4/* redo */: {
                    this.redo();
                    return;   
                }
            }
        });
    }

    public insert(edit: Edit, id: ID) {
        const { range } = edit;
        const { startLineNumber, startColumn, endLineNumber, endColumn } = range;

        this.documentTree
    }

    public delete(edit: Edit, id: ID) {
        const { range } = edit;
        const { startLineNumber, startColumn, endLineNumber, endColumn } = range;

    }

    public undo() {}

    public redo() {}
    
    public getText() {
        let text = '';
        const segments = this.documentTree.getAllSegments();

        segments.forEach((segment: Segment) => text += segment.text);
        
        return text;
    }
    
    private splitSegment(segment: Segment, offset: Range) {
        const res = segment.split(offset, this.editorModel);
        this.documentTree.splayNode(segment);

        return res;
    }

    private initState() {
        const text = this.getText();
        this.editorModel.setValue(text);

        this.regularCheckPendingOperations(10000);
    }

    private regularCheckPendingOperations(interval: number) {
        setInterval(this.checkPendingOperations, interval);
    }

    private checkPendingOperations() {
        const { length } = this.pendingOperations;

        for (let i = length - 1; i >= 0; i--) {
            const edits = this.pendingOperations[i];

            this.integrateEditsFromSinglePeer(edits);
        }
    }

    private canIntegrateEditsFromSinglePeer(edits: Edits) {
        const ary = edits.editArray;
        const { length } = ary;
        let res: boolean = true;

        for (let i = 0; i < length; i++) {
            const edit = ary[i];
            switch (edit.type) {
                case 1/* insert */: 
                case 2/* delete */: {
                    const hasLeftAndRightDependencies = (
                        this.segmentShortCut.has(edit.leftDependency) &&
                        this.segmentShortCut.has(edit.rightDependency)
                    );

                    if (hasLeftAndRightDependencies) continue;
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

        return res;
    }
}