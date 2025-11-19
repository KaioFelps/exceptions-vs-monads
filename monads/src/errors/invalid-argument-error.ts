export class InvalidArgumentError implements Error {
    public name: string = InvalidArgumentError.name;

    public constructor(
        public message: string,
        public field: string,
        public cause?: unknown,
    ) {}
}
