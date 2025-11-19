export class NotFoundError implements Error {
    name: string = NotFoundError.name;

    public constructor(
        public message: string,
        public cause?: unknown,
    ) {}
}
