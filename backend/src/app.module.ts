import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { BlogsModule } from './modules/blogs/blogs.module';
import { ServicesModule } from './modules/services/services.module';
import { CategoryModule } from './modules/categories/category.module';
import { TagModule } from './modules/tags/tag.module';
import { LeadsModule } from './modules/leads/leads.module';
import { VisitorsModule } from './modules/visitors/visitor.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { SeoModule } from './modules/seo/seo.module';
import { SettingsModule } from './modules/settings/settings.module';
import { HealthModule } from './modules/health/health.module';
import { WebsocketModule } from './websocket/websocket.module';
import { TestimonialModule } from './modules/testimonials/testimonial.module';
import { ProjectModule } from './modules/projects/project.module';
import { JobModule } from './modules/jobs/job.module';
import { NewslettersModule } from './modules/newsletter/newsletter.module';
import { Newsletter, NewsletterSchema } from './database/schemas/newsletter.schema';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { VisitorMiddleware } from './common/middleware/visitor.middleware';
import { Visitor, VisitorSchema } from './database/schemas/visitor.schema';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (c: ConfigService) => ({ uri: c.get('MONGODB_URI','mongodb://localhost:27017/seoplatform') }),
    }),
    MongooseModule.forFeature([{name:Visitor.name,schema:VisitorSchema},{name:Newsletter.name,schema:NewsletterSchema}]),
    ThrottlerModule.forRoot([{ttl:60000,limit:100}]),
    ScheduleModule.forRoot(),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (c: ConfigService) => ({ redis: { host: c.get('REDIS_HOST','localhost'), port: +c.get('REDIS_PORT',6379) } }),
    }),
    HealthModule, WebsocketModule, AuthModule, UsersModule, RolesModule,
    BlogsModule, ServicesModule, CategoryModule, TagModule,
    LeadsModule, VisitorsModule, AnalyticsModule, SeoModule, SettingsModule,
    TestimonialModule, ProjectModule, JobModule, NewslettersModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
    consumer.apply(VisitorMiddleware).forRoutes('*');
  }
}
