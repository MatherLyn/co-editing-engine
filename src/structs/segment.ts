import { monaco } from 'react-monaco-editor';
import ID from 'src/structs/id';
import Range from 'src/structs/range';
import { INode } from 'src/structs/splay-tree';

interface ISegmentOptions {
    id: ID;
    range: Range;
    text: string;
    isVisible: boolean;
    offset?: Range;
    parent: Segment | null;
    prev: Segment | null;
    next: Segment | null;
    nextSplit: Segment | null;
}

export default class Segment implements INode {
    public id: ID;
    public range: Range;
    public text: string;
    public isVisible: boolean;
    public offset?: Range;
    public subTreeSize: number; // the cache of sub tree size
    public parent: Segment | null;
    public prev: Segment | null;
    public next: Segment | null;
    public nextSplit: Segment | null;

    public constructor(options: ISegmentOptions) {
        const { id, range, text, parent, prev, next, isVisible, offset, nextSplit } = options;
        this.id = id;
        this.range = range;
        this.text = text;
        this.isVisible = isVisible;
        this.offset = typeof offset === 'undefined' ? undefined : offset;
        this.parent = parent;
        this.prev = prev;
        this.next = next;
        this.nextSplit = nextSplit;
        this.subTreeSize = this.calcSubTreeSize;
    }

    public get calcSubTreeSize() {
        if (!this.prev && !this.next) return this.text.length;

        let res = 0;

        if (this.prev) res += this.prev.calcSubTreeSize;

        if (this.next) res += this.next.calcSubTreeSize;

        return res;
    }

    public get length() {
        return this.text.length;
    }

    public split(offset: Range, editorModel: monaco.editor.ITextModel): [Segment, Segment] {
        const { id, range, isVisible } = this;
        const { startLineNumber, startColumn, endLineNumber, endColumn } = range;

        const rightRange = new Range({
            startLineNumber: offset.startLineNumber,
            startColumn: offset.startColumn,
            endLineNumber,
            endColumn,
        });
        const leftRange = new Range({
            startLineNumber,
            startColumn,
            endLineNumber: offset.endLineNumber,
            endColumn: offset.endColumn,
        });

        const rightText = editorModel.getValueInRange(rightRange);
        const leftText = editorModel.getValueInRange(leftRange);

        const suffix = new Segment({
            id,
            range: rightRange,
            text: rightText,
            offset,
            isVisible,
            parent: null,
            prev: null,
            next: null,
            nextSplit: null,
        });

        this.range = leftRange;
        this.text = leftText;
        this.next = suffix;
        this.nextSplit = suffix;

        return [this, suffix];
    }

    public setInvisible() {
        this.isVisible = false;
    }
}