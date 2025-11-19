import { Injectable } from "@nestjs/common";
import { InMemoryDatastore } from "src/datastore/in-memory-client.provider";
import { Fern } from "./fern";

@Injectable()
export class FernsRepository {
    public constructor(private datastore: InMemoryDatastore) {}

    public async findMany() {
        return await this.datastore.all();
    }

    public async insert(fern: Fern) {
        await this.datastore.insert(fern);
        return fern;
    }

    public async update(fern: Fern) {
        await this.datastore.update(fern);
        return fern;
    }

    public async findOneById(id: string) {
        return await this.datastore.findOneById(id);           
    }

    public async findOptionalById(id: string) {
        return await this.datastore.findOptionalById(id);
    }

    public async deleteById(id: string) {
        await this.datastore.deleteById(id);
    }
}
