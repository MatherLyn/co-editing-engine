export class ID {
    public constructor(
        private clientID: number,
        private vectorClock: number
    ) {}

    public get site() {
        return this.clientID;
    }

    public get seq() {
        return this.vectorClock;
    }

    public increaseSeq() {
        return ++this.vectorClock;
    }
}
