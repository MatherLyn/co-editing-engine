import ID from 'src/structs/id';
import Range from 'src/structs/range';
import Operation from './operation';

interface IInsertionOptions {
    id: ID;
    text: string;
    leftDependency: string;
    leftOffset?: Range;
    rightDependency: string;
    rightOffset?: Range;
}

export default class Insertion extends Operation {
    public readonly text: string;

    public constructor(options: IInsertionOptions) {
        super(options);

        const { text } = options;

        this.text = text;
        this.type = 1;
    }
}