import ID from 'src/structs/id';
import Edit from 'src/operations/edit';

interface IEditsOptions {
    id: ID;
    editArray: Edit[];   
}

/**
 * An Edits means a series of edits from one peer.
 */
export default class Edits {
    public id: ID;
    public editArray: Edit[];

    public static deserialize(serializedString: string): Edit[] {
        return JSON.parse(serializedString);
    }

    public constructor(options: IEditsOptions) {
        const { id, editArray } = options;
        this.id = id;
        this.editArray = editArray;
    }

    public serialize() {
        return JSON.stringify(this);
    }
}