interface IIDOptions {
    readonly clientID: number;
    readonly vectorClock: number;
}

export default class ID {
    public clientID: number;
    public vectorClock: number;

    public static deserialize(serializedString: string): ID {
        const rawID = JSON.parse(serializedString);
        Reflect.setPrototypeOf(rawID, ID.prototype);

        return rawID as ID;
    }

    public static generateIDForNextOperation(currentID: ID) {
        const options: IIDOptions = {
            clientID: currentID.clientID,
            vectorClock: ++currentID.vectorClock,
        };
        
        return new ID(options);
    }

    public constructor(options: IIDOptions) {
        const { clientID, vectorClock } = options;
        this.clientID = clientID;
        this.vectorClock = vectorClock;
    }

    public serialize() {
        return JSON.stringify(this);
    }

    public equals(id: ID) {
        return (this.clientID === id.clientID) && (this.vectorClock === id.vectorClock);
    }

    public isSmallerThan(id: ID) {
        return this.clientID < id.clientID || (this.clientID === id.clientID && this.vectorClock < id.vectorClock);
    }

    public toString() {
        return `c${this.clientID}v${this.vectorClock}`;
    }
}
