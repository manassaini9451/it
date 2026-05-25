import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeoController } from './seo.controller';
import { SeoService } from './seo.service';
import { Setting, SettingSchema } from '../../database/schemas/setting.schema';
@Module({
  imports: [MongooseModule.forFeature([{name:Setting.name,schema:SettingSchema}])],
  controllers: [SeoController], providers: [SeoService], exports: [SeoService],
})
export class SeoModule {}
