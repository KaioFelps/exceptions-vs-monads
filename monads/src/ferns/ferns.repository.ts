import { Injectable } from "@nestjs/common";
import { InMemoryDatastore } from "src/datastore/in-memory-client.provider";
import { Fern } from "./fern";
import { pipe } from "fp-ts/lib/function";
import { taskEither } from "fp-ts";
import { DatastoreError } from "src/datastore/datastore.error";

@Injectable()
export class FernsRepository {
    public constructor(private datastore: InMemoryDatastore) {}

    public async findMany() {
        return await taskEither.tryCatch(
            () => this.datastore.all(),
            (error) => error as DatastoreError)();
    }

    public async insert(fern: Fern) {
        return await pipe(
            taskEither.tryCatch(
                () => this.datastore.insert(fern),
                (error) => error as DatastoreError
            ),
            taskEither.map(() => fern))();
    }

    public async update(fern: Fern) {
        return await pipe(
            taskEither.tryCatch(
                () => this.datastore.update(fern),
                (error) => error as DatastoreError
            ),
            taskEither.map(() => fern))();
    }

    public async findOneById(id: string) {
        return await taskEither.tryCatch(
            () => this.datastore.findOneById(id),
            (error) => error as DatastoreError)();
    }

    public async findOptionalById(id: string) {
        return await taskEither.tryCatch(
            () => this.datastore.findOptionalById(id),
            (error) => error as DatastoreError)();
    }

    public async deleteById(id: string) {
        return await pipe(
            taskEither.tryCatch(
                () => this.datastore.deleteById(id),
                (error) => error as DatastoreError,
            ),
            taskEither.map((_) => {}))();
    }
}
