import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Visitor, VisitorSchema } from '../../database/schemas/visitor.schema';
import { VisitorService } from './visitor.service';
import { VisitorController } from './visitor.controller';
import { VisitorPingController } from './visitor-ping.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Visitor.name, schema: VisitorSchema }])],
  controllers: [VisitorController, VisitorPingController],
  providers: [VisitorService],
  exports: [MongooseModule, VisitorService],
})
export class VisitorsModule {}