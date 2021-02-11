import { ID } from "./id";
import { Position } from "./position";

export class Segment {
    public constructor(
        private id: ID,
        private position: Position,
        private content: string,
        private extent: Position,
        private nextSegment: Segment | null,
        private deletions: Set<string>
    ) {}
}