import { Controller, Get, Put, Post, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SeoService } from './seo.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Public } from '../../common/decorators';
@ApiTags('SEO') @Controller({ path: 'seo', version: '1' })
export class SeoController {
  constructor(private svc: SeoService) {}
  @Public() @Get() getPageSeo(@Query('page') page: string) { return this.svc.getPageSeo(page||'home'); }
  @ApiBearerAuth('JWT-auth') @UseGuards(JwtAuthGuard,RolesGuard) @Roles('super-admin','admin','editor')
  @Put() updatePageSeo(@Query('page') page: string, @Body() body: any) { return this.svc.updatePageSeo(page||'home',body); }
  @ApiBearerAuth('JWT-auth') @UseGuards(JwtAuthGuard,RolesGuard) @Roles('super-admin','admin')
  @Get('audit') getAudit() { return this.svc.getAudit(); }
  @ApiBearerAuth('JWT-auth') @UseGuards(JwtAuthGuard,RolesGuard) @Roles('super-admin','admin')
  @Post('sitemap/generate') generateSitemap() { return this.svc.getSitemap(); }
}
