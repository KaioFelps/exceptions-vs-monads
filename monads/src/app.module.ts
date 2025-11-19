import { Module } from '@nestjs/common';
import { DatastoreModule } from './datastore/datastore.module';
import { FernsModule } from './ferns/ferns.module';

@Module({
  imports: [DatastoreModule, FernsModule],
})
export class AppModule {}
