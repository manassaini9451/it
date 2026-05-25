import { Controller, Get, Post, Put, Delete, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { LeadService } from './lead.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Public } from '../../common/decorators';
@ApiTags('Leads') @Controller({ path: 'leads', version: '1' })
export class LeadController {
  constructor(private svc: LeadService) {}
  @ApiBearerAuth('JWT-auth') @UseGuards(JwtAuthGuard,RolesGuard) @Roles('super-admin','admin')
  @Get() findAll(@Query('page') p=1, @Query('limit') l=20, @Query() q: any) { return this.svc.findAll(+p,+l,q); }
  @ApiBearerAuth('JWT-auth') @UseGuards(JwtAuthGuard,RolesGuard) @Roles('super-admin','admin')
  @Get('stats') getStats() { return this.svc.getStats(); }
  @ApiBearerAuth('JWT-auth') @UseGuards(JwtAuthGuard,RolesGuard) @Roles('super-admin','admin')
  @Get(':id') findOne(@Param('id') id: string) { return this.svc.findOne(id); }
  @Public() @Post() create(@Body() body: any) { return this.svc.create(body); }
  @ApiBearerAuth('JWT-auth') @UseGuards(JwtAuthGuard,RolesGuard) @Roles('super-admin','admin')
  @Patch(':id') update(@Param('id') id: string, @Body() body: any) { return this.svc.update(id,body); }
  @ApiBearerAuth('JWT-auth') @UseGuards(JwtAuthGuard,RolesGuard) @Roles('super-admin','admin')
  @Post(':id/notes') addNote(@Param('id') id: string, @Body() body: any) { return this.svc.addNote(id,body); }
  @ApiBearerAuth('JWT-auth') @UseGuards(JwtAuthGuard,RolesGuard) @Roles('super-admin')
  @Delete(':id') remove(@Param('id') id: string) { return this.svc.remove(id); }
}
