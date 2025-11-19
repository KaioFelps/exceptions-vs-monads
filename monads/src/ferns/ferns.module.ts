import { Module } from "@nestjs/common";
import { FernsController } from "./ferns.controller";
import { FernsRepository } from "./ferns.repository";
import { FernsService } from "./ferns.service";
import { DatastoreModule } from "src/datastore/datastore.module";

@Module({
    controllers: [FernsController],
    providers: [FernsRepository, FernsService],
    imports: [DatastoreModule],
})
export class FernsModule{}
