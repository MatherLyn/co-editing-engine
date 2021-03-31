import { monaco } from 'react-monaco-editor';
import Range from 'src/structs/range';

interface IEditOptions extends monaco.editor.IModelContentChange {
    range: Range;
    forceMoveMarkers: boolean;
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

    public static deserialize(serializedString: string): Edit {
        return JSON.parse(serializedString);
    }

    public constructor(options: IEditOptions) {
        const { range, rangeOffset, rangeLength, text, forceMoveMarkers } = options;
        this.range = range;
        this.text = text;
        this.rangeOffset = rangeOffset;
        this.rangeLength = rangeLength;
        this.forceMoveMarkers = forceMoveMarkers;
    }

    public serialize() {
        return JSON.stringify(this);
    }
}