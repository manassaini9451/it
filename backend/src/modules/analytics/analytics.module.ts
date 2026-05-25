import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Visitor, VisitorSchema } from '../../database/schemas/visitor.schema';
@Module({
  imports: [MongooseModule.forFeature([{name:Visitor.name,schema:VisitorSchema}])],
  controllers: [AnalyticsController], providers: [AnalyticsService], exports: [AnalyticsService],
})
export class AnalyticsModule {}
