import { monaco } from 'react-monaco-editor';
import ID from 'src/structs/id';
import Range from 'src/structs/range';
import Segment from 'src/structs/segment';

interface IEditOptions extends monaco.editor.IModelContentChange {
    id: ID;
    range: Range;
    forceMoveMarkers: boolean;
    leftDependency?: string;
    rightDependency?: string;
    type?: 1 | 2 | 3 | 4;
}

export default class Edit implements monaco.editor.IModelContentChange {
    /**
     * The range that got replaced.
     */
    public readonly range: Range;
    /**
     * The offset of the range that got replaced.
     */
    public readonly rangeOffset: number;
    /**
     * The length of the range that got replaced.
     */
    public readonly rangeLength: number;
    /**
     * The new text for the range.
     */
    public readonly text: string;
    public readonly forceMoveMarkers: boolean;

    public readonly id: ID;
    public leftDependency: string;
    public rightDependency: string;
    /**
     * an edit has the following type:
     * - 0: unset
     * - 1: insert
     * - 2: delete
     * - 3: undo
     * - 4: redo
     */
    public type: 0 | 1 | 2 | 3 | 4;

    public static deserialize(serializedString: string): Edit {
        return JSON.parse(serializedString);
    }

    public constructor(options: IEditOptions) {
        const { id, range, rangeOffset, rangeLength, text, forceMoveMarkers, leftDependency, rightDependency, type } = options;

        //#region these are implemented by monaco.editor.IModelContentChange
        this.range = range;
        this.text = text;
        this.rangeOffset = rangeOffset;
        this.rangeLength = rangeLength;
        this.forceMoveMarkers = forceMoveMarkers;
        //#endregion

        //#region these are custom properties
        this.id = id;
        this.leftDependency = leftDependency || '';
        this.rightDependency = rightDependency || '';
        this.type = type || 0;
        //#endregion
    }

    public setDependencies(left: string, right: string) {
        this.leftDependency = left;
        this.rightDependency = right;
    }

    public setType(type: 1 | 2 | 3 | 4) {
        this.type = type;
    }

    public serialize() {
        return JSON.stringify(this);
    }
}