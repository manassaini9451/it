import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Public } from '../../common/decorators';

@ApiTags('Settings')
@Controller({ path: 'settings', version: '1' })
export class SettingsController {
  constructor(private svc: SettingsService) {}

  @Public() @Get('stats')     getStats()   { return this.svc.getStats(); }
  @Public() @Get('hero')      getHero()    { return this.svc.getHero(); }
  @Public() @Get('about')     getAbout()   { return this.svc.getAbout(); }
  @Public() @Get('contact')   getContact() { return this.svc.getContact(); }
  @Public() @Get('faqs')      getFaqs()    { return this.svc.getFaqs(); }
  @Public() @Get('pricing')   getPricing() { return this.svc.getPricing(); }
  @Public() @Get('features')  getFeatures(){ return this.svc.getFeatures(); }
  @Public() @Get('cta')       getCta()     { return this.svc.getCta(); }
  @Public() @Get('general')   getGeneral() { return this.svc.getGeneral(); }

  @ApiBearerAuth('JWT-auth') @UseGuards(JwtAuthGuard, RolesGuard) @Roles('super-admin', 'admin')
  @Get() getAll() { return this.svc.getAll(); }

  @ApiBearerAuth('JWT-auth') @UseGuards(JwtAuthGuard, RolesGuard) @Roles('super-admin', 'admin')
  @Get(':key') getOne(@Param('key') key: string) { return this.svc.get(key); }

  @ApiBearerAuth('JWT-auth') @UseGuards(JwtAuthGuard, RolesGuard) @Roles('super-admin', 'admin')
  @Put(':key') update(@Param('key') key: string, @Body() body: any) { return this.svc.set(key, body); }
}
