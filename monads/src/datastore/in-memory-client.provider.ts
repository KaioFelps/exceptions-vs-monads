import { Injectable } from "@nestjs/common";
import { Fern } from "src/ferns/fern";
import { DatastoreError } from "./datastore.error";

@Injectable()
export class InMemoryDatastore {
    private ferns: Fern[] = []

    private mayThrowError() {
        const someInternalErrorHappened = Math.random() <= 0.2;

        if (someInternalErrorHappened) {
            throw new DatastoreError(
                "internal_db_error",
                "Um erro externo que é lançado. Seu lançamento foge do nosso controle.");
        }
    }

    public async all() {
        this.mayThrowError();
        return [...this.ferns];
    }

    public async deleteById(id: string) {
        this.mayThrowError();

        let removedRowsCounter = 0;

        this.ferns = this.ferns.filter(fern => {
            const matches = fern.id === id;
            if (matches) removedRowsCounter++;
            return matches;
        }); 

        return removedRowsCounter;
    }

    public async insert(fern: Fern) {
        this.mayThrowError();

        const violatesUniqueConstraint = this
            .ferns
            .find(storedFern => storedFern.scientificName === fern.scientificName);

        if (!violatesUniqueConstraint) {
            this.ferns.push(fern);
            return;
        }

        throw new DatastoreError(
            "unique_constraint", "Já existe uma samambaia com nome científico "
            + fern.scientificName);
    }

    public async update(fern: Fern) {
        this.ferns = this.ferns.map(storedFern => {
            if (storedFern.id === fern.id) return fern;
            return storedFern;
        })
    }

    public async findOneById(id: string) {
        this.mayThrowError();
        const fern = this.ferns.filter(fern => fern.id === id);
        
        if (fern.length === 0) {
            throw new DatastoreError("no_rows_found", "Nenhuma samambaia encontrada com ID " + id);
        }

        if (fern.length > 1) {
            throw new DatastoreError("multiple_rows_found", "Mais de 1 samambaia encontrada co ID " + id);
        }

        return fern[0];
    }

    public async findOptionalById(id: string) {
        this.mayThrowError();
        const fern = this.ferns.find(fern => fern.id === id);
        return fern;
    }
}
