import { monaco } from 'react-monaco-editor';
import Edit from 'src/operations/edit';
import Edits from 'src/operations/edits';
import ID from 'src/structs/id';
import DocumentTree from './document-tree';

interface IDocumentOptions {
    readonly clientID: number;
    history: Edits;
    editorModel: monaco.editor.ITextModel;
}

export default class Document {
    public readonly clientID: number;
    public history: Edits;
    private editorModel: monaco.editor.ITextModel;
    private documentTree: DocumentTree;
    private undoStack: Edit[];
    private redoStack: Edit[];
    private operationPool: Edit[];

    public constructor(options: IDocumentOptions) {
        const { clientID, history, editorModel } = options;

        this.clientID = clientID;
        this.history = history;
        this.editorModel = editorModel;
        this.documentTree = new DocumentTree({ clientID });
        this.undoStack = [];
        this.redoStack = [];
        this.operationPool = [];
    }

    public initState() {
        this.editorModel.applyEdits(this.history.editArray);
    }

    public integrateOperations(edits: Edits) {}

    public insert() {}

    public delete() {}

    public undo() {}

    public redo() {}

    private canIntegrateOperations(edits: Edits) {}
}