export class Position {
    constructor(
        public readonly row: number,
        public readonly col: number
    ) {}
}

export const ZERO_POSITION = new Position(0, 0);
