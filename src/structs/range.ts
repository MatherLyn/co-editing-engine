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

    public isIntersectedWith(range: Range) {
        return !(this.isBefore(range) || this.isAfter(range));
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
