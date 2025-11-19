export class InternalError implements Error {
    name: string = InternalError.name;

    public constructor(
        public message: string,
        public cause?: unknown,
    ) {}
}