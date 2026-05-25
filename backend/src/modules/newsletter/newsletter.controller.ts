import { Controller, Post, Delete, Get, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { NewsletterService } from './newsletter.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Public } from '../../common/decorators';

@ApiTags('Newsletter')
@Controller({ path: 'newsletter', version: '1' })
export class NewsletterController {
  constructor(private svc: NewsletterService) {}

  @Public()
  @Post('subscribe')
  subscribe(@Body() body: { email: string; name?: string; source?: string }) {
    return this.svc.subscribe(body.email, body.name, body.source);
  }

  @Public()
  @Post('unsubscribe')
  unsubscribe(@Body() body: { email: string }) {
    return this.svc.unsubscribe(body.email);
  }

  @ApiBearerAuth('JWT-auth') @UseGuards(JwtAuthGuard, RolesGuard) @Roles('super-admin', 'admin')
  @Get()
  findAll(@Query('page') page = '1', @Query('limit') limit = '20', @Query('search') search = '') {
    return this.svc.findAll(+page, +limit, search);
  }

  @ApiBearerAuth('JWT-auth') @UseGuards(JwtAuthGuard, RolesGuard) @Roles('super-admin', 'admin')
  @Get('stats')
  getStats() {
    return this.svc.getStats();
  }
}
