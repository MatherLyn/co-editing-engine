import { monaco } from 'react-monaco-editor';
import ID from 'src/structs/id';
import Range from 'src/structs/range';
import { INode } from 'src/structs/splay-tree';

interface ISegmentOptions {
    id: ID;
    range: Range;
    text: string;
    isVisible?: boolean;
    offset?: Range;
    parent: Segment | null;
    prev: Segment | null;
    next: Segment | null;
    nextSplit: Segment | null;
}

export default class Segment implements INode {
    public id: ID;
    public range: Range; // the cache of range
    public text: string;
    public isVisible: boolean;
    public offset: Range;
    public subTreeRange: Range; // the cache of sub tree's range
    public parent: Segment | null;
    public prev: Segment | null;
    public next: Segment | null;
    public nextSplit: Segment | null;

    public constructor(options: ISegmentOptions) {
        const { id, range, text, parent, prev, next, isVisible, offset, nextSplit } = options;
        this.id = id;
        this.range = range;
        this.text = text;
        this.isVisible = typeof isVisible === 'undefined' ? true : isVisible;
        this.offset = offset || new Range({ startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 });
        this.parent = parent;
        this.prev = prev;
        this.next = next;
        this.nextSplit = nextSplit;

        this.subTreeRange = this.calcSubTreeRange;
    }

    public get calcSubTreeRange() {
        let res = this.range;

        if (!this.prev && !this.next) return res;

        if (this.prev && this.prev !== this.parent) res = res.getMergedRangeWith(this.prev.calcSubTreeRange);

        if (this.next && this.next !== this.parent) res = res.getMergedRangeWith(this.next.calcSubTreeRange);

        return res;
    }

    public setID(id: ID) {
        this.id = id;
    }

    public split(offset: Range/* must be a point */): [Segment, Segment] {
        const { id, range, isVisible } = this;
        const { startLineNumber, startColumn, endLineNumber, endColumn } = range;
        let boundaryLineNumber: number;
        let boundaryColumn: number;
        
        if (startLineNumber !== offset.startLineNumber) {
            boundaryLineNumber = offset.startLineNumber;
            boundaryColumn = offset.startColumn;
        } else {
            boundaryLineNumber = offset.startLineNumber - this.offset.startLineNumber + startLineNumber;
            boundaryColumn = offset.startColumn - this.offset.startColumn + startColumn;
        }

        const rightRange = new Range({
            startLineNumber: boundaryLineNumber,
            startColumn: boundaryColumn,
            endLineNumber,
            endColumn,
        });
        const leftRange = new Range({
            startLineNumber,
            startColumn,
            endLineNumber: boundaryLineNumber,
            endColumn: boundaryColumn,
        });

        const rightText = this.getTextInRange(rightRange);
        const leftText = this.getTextInRange(leftRange);

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

        return [this, suffix];
    }

    public setInvisible() {
        this.isVisible = false;

        const { startLineNumber, startColumn } = this.range;
        this.range = new Range({ startLineNumber, startColumn, endLineNumber: startLineNumber, endColumn: startColumn });
    }

    public toString() {
        return `${this.id.toString()};${this.offset === undefined ? '' : this.offset.toString()}`;
    }

    private getTextInRange(range: Range) {
        if (!range.isIn(this.range)) return '';

        const { text } = this;
        const { startLineNumber, startColumn, endLineNumber, endColumn } = range;
        let res = '';
        let startTraverse = false;
        let lineNumber = this.range.startLineNumber;
        let column = this.range.startColumn;

        for (let i = 0; i < text.length; i++) {
            if (lineNumber === startLineNumber && column === startColumn) startTraverse = true;
            if (lineNumber === endLineNumber && column === endColumn) {
                break;
            }

            if (startTraverse) res += text[i];

            if (text[i] === '\n') {
                lineNumber++;
                column = 0;
            }
            column++;
        }

        return res;
    }
}