import { UUID } from "node:crypto";

export class Fern {
    public constructor(
        public id: UUID,
        public name: string,
        public scientificName: string
    ) {}
}
