import { Module } from '@nestjs/common';
import { InMemoryDatastore } from './in-memory-client.provider';

@Module({
    providers: [InMemoryDatastore],
    exports: [InMemoryDatastore]
})
export class DatastoreModule {}
