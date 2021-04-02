import { IRange } from 'monaco-editor';

interface IRangeOptions {
    readonly startLineNumber: number;
    readonly startColumn: number;
    readonly endLineNumber: number;
    readonly endColumn: number;
}

export default class Range implements IRange {
    public readonly startLineNumber: number;
    public readonly startColumn: number;
    public readonly endLineNumber: number;
    public readonly endColumn: number;

    public static deserialize(serializedString: string): Range {
        return JSON.parse(serializedString);
    }

    public static pointIsInRange(lineNumber: number, column: number, range: Range) {
        const { startLineNumber, startColumn, endLineNumber, endColumn } = range;

        if (lineNumber === startLineNumber) return column >= startColumn;

        if (lineNumber === endLineNumber) return column <= endColumn;

        return (lineNumber > startLineNumber && lineNumber < endLineNumber);
    }

    public static pointIsBeforeRange(lineNumber: number, column: number, range: Range) {
        const { startLineNumber, startColumn } = range;
        
        return (
            lineNumber < startLineNumber ||
            (lineNumber === startLineNumber && column < startColumn)
        );
    }

    public static pointIsAfterRange(lineNumber: number, column: number, range: Range) {
        const { endLineNumber, endColumn } = range;
        
        return (
            lineNumber > endLineNumber ||
            (lineNumber === endLineNumber && column > endColumn)
        );
    }

    public static pointIsAtEnd(lineNumber: number, column: number, wholeRange: Range) {
        const { endLineNumber, endColumn } = wholeRange;

        return lineNumber === endLineNumber && column === endColumn;
    }

    public constructor(options: IRangeOptions) {
        const { startLineNumber, startColumn, endLineNumber, endColumn } = options;
        this.startLineNumber = startLineNumber;
        this.startColumn = startColumn;
        this.endLineNumber = endLineNumber;
        this.endColumn = endColumn;
    }

    public serialize() {
        return JSON.stringify(this);
    }

    public getMergedRangeWith(range: Range) {
        const { startLineNumber, startColumn, endLineNumber, endColumn } = range;

        const resStartLineNumber = Math.min(startLineNumber, this.startLineNumber);
        const resStartColumn = Math.min(startColumn, this.startColumn);
        const resEndLineNumber = Math.max(endLineNumber, this.endLineNumber);
        const resEndColumn = Math.max(endColumn, this.endColumn);

        return new Range({
            startLineNumber: resStartLineNumber,
            startColumn: resStartColumn,
            endLineNumber: resEndLineNumber,
            endColumn: resEndColumn,
        });
    }

    public equals(range: Range) {
        return (
            this.startLineNumber === range.startLineNumber &&
            this.startColumn === range.startColumn &&
            this.endLineNumber === range.endLineNumber &&
            this.endColumn === range.endColumn
        );
    }

    public isIntersectedWith(range: Range) {
        return !(this.isBefore(range) || this.isAfter(range));
    }

    public inclues(range: Range) {
        return range.isIn(this);
    }

    public isIn(range: Range) {
        if (
            (this.startLineNumber < range.startLineNumber || this.endLineNumber > range.endLineNumber) ||
            this.startLineNumber === range.startLineNumber && this.startColumn < range.startColumn ||
            this.endLineNumber === range.endLineNumber && this.endColumn > range.endColumn
        ) return false;
        
        return true;
    }

    public isBefore(range: Range) {
        if (this.endLineNumber < range.startLineNumber) return true;
        
        if (this.endLineNumber === range.startLineNumber) return this.endColumn <= range.startColumn;

        return false;
    }

    public isAfter(range: Range) {
        if (this.startLineNumber > range.endLineNumber) return true;

        if (this.startLineNumber === range.endLineNumber) return this.startColumn >= range.endColumn;

        return false;
    }
}

export const DEFAULT_RANGE = new Range({
    startLineNumber: 1,
    startColumn: 1,
    endLineNumber: 1,
    endColumn: 1,
});
