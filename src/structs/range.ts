import { IRange } from "monaco-editor";

export default class Range implements IRange {
    public static deserialize(serializedString: string) {
        const splitArray = serializedString.split(', ');
        const startLineNumber = parseInt(splitArray[0]);
        const startColumn = parseInt(splitArray[1]);
        const endLineNumber = parseInt(splitArray[2]);
        const endColumn = parseInt(splitArray[3]);

        return new Range(startLineNumber, startColumn, endLineNumber, endColumn);
    }

    public constructor(
        public readonly startLineNumber: number,
        public readonly startColumn: number,
        public readonly endLineNumber: number,
        public readonly endColumn: number,
    ) {}

    public serialize() {
        return `${this.startLineNumber}, ${this.startColumn}, ${this.endLineNumber}, ${this.endColumn}`;
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

export const ZERO_POSITION = new Range(1, 1, 1, 1);
