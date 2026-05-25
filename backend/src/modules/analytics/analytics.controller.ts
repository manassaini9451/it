import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators';
@ApiTags('Analytics') @ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard,RolesGuard)
@Controller({ path: 'analytics', version: '1' })
export class AnalyticsController {
  constructor(private svc: AnalyticsService) {}
  @Get('dashboard') @Roles('super-admin','admin')
  getDashboard(@Query('from') from?: string, @Query('to') to?: string) {
    return this.svc.getDashboard(from?new Date(from):new Date(Date.now()-30*24*60*60*1000), to?new Date(to):new Date());
  }
  @Get('realtime') @Roles('super-admin','admin') getRealtime() { return this.svc.getRealtime(); }
  @Get('active') @Roles('super-admin','admin') getActive() { return this.svc.getActive().then(c=>({activeVisitors:c})); }
}
