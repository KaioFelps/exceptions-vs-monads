import { Injectable } from "@nestjs/common";
import { FernsRepository } from "./ferns.repository";
import { Fern } from "./fern";
import { randomUUID } from "node:crypto"
import { InternalError } from "src/errors/internal-error";
import { DatastoreError } from "src/datastore/datastore.error";
import { NotFoundError } from "src/errors/not-found-error";
import { InvalidArgumentError } from "src/errors/invalid-argument-error";
import { pipe } from "fp-ts/lib/function";
import { taskEither } from "fp-ts";
import { teFromEP } from "src/lib/fp-ts";

type CreateFern = {
    name: string;
    scientificName: string
}

type UpdateFern = {
    id: string;
    name?: string;
    scientificName?: string;
}

@Injectable()
export class FernsService {
    public constructor(private repository: FernsRepository) {}

    private static internalErrorMessage = "Alguma coisa deu errada. Tente mais tarde.";

    public async list() {
        return await this.repository.findMany();
    }

    public async findById(id: string) {
        return await pipe(
            teFromEP(this.repository.findOptionalById(id)),
            taskEither.map((fern) => {
                if (fern) return taskEither.right(fern);
                return taskEither.left(new NotFoundError("Não foi encontrada nenhuma samambaia com ID " + id));
            }),
            taskEither.flattenW)();
    }

    public async store({ name, scientificName }: CreateFern) {
        const fern = new Fern(randomUUID(), name, scientificName);
        return await pipe(
            teFromEP(this.repository.insert(fern) ),
            taskEither.mapError((error) => {
                if (error instanceof DatastoreError && error.type === "unique_constraint") {
                    return new InvalidArgumentError(error.message, "scientificName", error);
                }
                return new InternalError(FernsService.internalErrorMessage, error);
            }))();
    }

    public async deleteById(id: string) {
        return await pipe(
            teFromEP(this.repository.deleteById(id)),
            taskEither.mapError((error) => new InternalError(FernsService.internalErrorMessage, error)))();
    }
    
    public async save({ id, name, scientificName }: UpdateFern) {
        return await pipe(
            teFromEP(this.repository.findOneById(id)),
            taskEither.map((fern) => {
                if (name) fern.name = name;
                if (scientificName) fern.scientificName = scientificName;
                return teFromEP(this.repository.update(fern))
            }),
            taskEither.flattenW,
            taskEither.mapError((error) => {
                if (error instanceof DatastoreError) {
                    if (error.type === "multiple_rows_found") {
                        console.warn("Estado lógico inválido detectado", error.message, error.cause);
                        return new InternalError("Alguma coisa deu errada. Tente mais tarde.");
                    }
                    if (error.type === "no_rows_found") {
                        return new NotFoundError("Não foi encontrada nenhuma samambaia com ID " + id);
                    }
                    if (error.type === "unique_constraint") {
                        return new InvalidArgumentError(error.message, "name", error);
                    }
                }
                return new InternalError("Alguma coisa deu errada. Tente mais tarde.", error);
            }))();
    }
}
