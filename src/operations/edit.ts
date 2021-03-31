import { monaco } from 'react-monaco-editor';
import Range from '../structs/range';

export default class Edit implements monaco.editor.IIdentifiedSingleEditOperation {
    public static deserialize(serializedString: string) {
        const splitArray = serializedString.split('; ');
        const range = Range.deserialize(splitArray[0]);
        const forceMoveMarkers = Boolean(splitArray[1]);
        const text = splitArray[2];

        return new Edit(range, text, forceMoveMarkers);
    }

    public constructor(
        public range: Range,
        public text: string,
        public forceMoveMarkers?: boolean,
    ) {}

    public serialize() {
        return `r: ${this.range.serialize()}; f: ${this.forceMoveMarkers === true ? 1 : 0}; t: ${this.text}`;
    }
}