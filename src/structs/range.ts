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
        return !Range.pointIsBeforeRange(lineNumber, column, range) && !Range.pointIsAfterRange(lineNumber, column, range);
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

    public isPoint() {
        return (this.startLineNumber === this.endLineNumber) && (this.startColumn === this.endColumn);
    }

    public isAtLeftEdgeOf(range: Range) {
        return (this.startLineNumber === range.startLineNumber) && (this.startColumn === range.startColumn);
    }

    public isAtRightEdgeOf(range: Range) {
        return (this.endLineNumber === range.endLineNumber) && (this.endColumn === range.endColumn);
    }

    public getMergedRangeWith(range: Range) {
        const { startLineNumber, startColumn, endLineNumber, endColumn } = range;
        let resStartLineNumber: number;
        let resEndLineNumber: number;
        let resStartColumn: number;
        let resEndColumn: number;

        /** special condition: eof */
        // if (endLineNumber === Infinity) return this;

        if (this.startLineNumber < range.startLineNumber) {
            resStartLineNumber = this.startLineNumber;
            resStartColumn = this.startColumn;
        } else if (this.startLineNumber === range.startLineNumber) {
            resStartLineNumber = this.startLineNumber;
            resStartColumn = Math.min(this.startColumn, range.startColumn);
        } else {
            resStartLineNumber = range.startLineNumber;
            resStartColumn = range.startColumn;
        }

        if (this.endLineNumber < range.endLineNumber) {
            resEndLineNumber = range.endLineNumber;
            resEndColumn = range.endColumn;
        } else if (this.endLineNumber === range.endLineNumber) {
            resEndLineNumber = this.endLineNumber;
            resEndColumn = Math.max(this.endColumn, range.endColumn);
        } else {
            resEndLineNumber = this.endLineNumber;
            resEndColumn = this.endColumn;
        }

        return new Range({
            startLineNumber: resStartLineNumber,
            startColumn: resStartColumn,
            endLineNumber: resEndLineNumber,
            endColumn: resEndColumn,
        });
    }

    public getMoved(diff: { lineNumber: number, column: number }) {
        const { lineNumber, column } = diff;

        const newStartLineNumber = this.startLineNumber + lineNumber;
        const newStartColumn = this.startColumn + column;
        const newEndLineNumber = this.endLineNumber + lineNumber;
        const newEndColumn = this.endColumn + column;

        return new Range({
            startLineNumber: newStartLineNumber,
            startColumn: newStartColumn,
            endLineNumber: newEndLineNumber,
            endColumn: newEndColumn,
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
            (this.startLineNumber === range.startLineNumber && this.startColumn < range.startColumn) ||
            (this.endLineNumber === range.endLineNumber && this.endColumn > range.endColumn)
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

export const MAX_RANGE = new Range({
    startLineNumber: -1,
    startColumn: -1,
    endLineNumber: Infinity,
    endColumn: Infinity,
});
