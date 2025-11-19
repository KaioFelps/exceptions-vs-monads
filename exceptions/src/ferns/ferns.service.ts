import { Injectable } from "@nestjs/common";
import { FernsRepository } from "./ferns.repository";
import { Fern } from "./fern";
import { randomUUID } from "node:crypto"
import { InternalError } from "src/errors/internal-error";
import { DatastoreError } from "src/datastore/datastore.error";
import { NotFoundError } from "src/errors/not-found-error";
import { InvalidArgumentError } from "src/errors/invalid-argument-error";

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
        let fern: Fern | undefined;
        try {
            fern = await this.repository.findOptionalById(id);
        } catch (error) {
            throw new InternalError(FernsService.internalErrorMessage, error);
        }

        if (!fern) throw new NotFoundError("Não foi encontrada nenhuma samambaia com ID " + id);
        return fern;
    }

    public async store({ name, scientificName }: CreateFern) {
        try {
            const fern = new Fern(randomUUID(), name, scientificName);
            return await this.repository.insert(fern);
        } catch (error) {
            if (error instanceof DatastoreError && error.type === "unique_constraint") {
                throw new InvalidArgumentError(error.message, "scientificName", error);
            }
            throw new InternalError(FernsService.internalErrorMessage, error);
        }
    }

    public async deleteById(id: string) {
        try {
          await this.repository.deleteById(id);
        } catch (error) {
            throw new InternalError(FernsService.internalErrorMessage, error);
        }
    }
    
    public async save({ id, name, scientificName }: UpdateFern) {
        try {
            const fern = await this.repository.findOneById(id);
            if (name) fern.name = name;
            if (scientificName) fern.scientificName = scientificName;
            return await this.repository.update(fern);
        } catch (error) {
            if (error instanceof DatastoreError) {
                if (error.type === "multiple_rows_found") {
                    console.warn("Estado lógico inválido detectado", error.message, error.cause);
                    throw new InternalError("Alguma coisa deu errada. Tente mais tarde.");
                }
                if (error.type === "no_rows_found") {
                    throw new NotFoundError("Não foi encontrada nenhuma samambaia com ID " + id);
                }
                if (error.type === "unique_constraint") {
                    throw new InvalidArgumentError(error.message, "name", error);
                }
            }
            throw new InternalError("Alguma coisa deu errada. Tente mais tarde.", error);
        }
    }
}
