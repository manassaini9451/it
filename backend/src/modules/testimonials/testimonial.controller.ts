import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TestimonialService } from './testimonial.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Public } from '../../common/decorators';
@ApiTags('Testimonials') @Controller({path:'testimonials',version:'1'})
export class TestimonialController {
  constructor(private svc: TestimonialService) {}
  @Public() @Get() findAll(@Query('page') p=1,@Query('limit') l=20,@Query() q: any) { return this.svc.findAll(+p,+l,q); }
  @Public() @Get('slug/:slug') findBySlug(@Param('slug') s: string) { return this.svc.findBySlug(s); }
  @Public() @Get(':id') findOne(@Param('id') id: string) { return this.svc.findOne(id); }
  @ApiBearerAuth('JWT-auth') @UseGuards(JwtAuthGuard,RolesGuard) @Roles('super-admin','admin','editor') @Post() create(@Body() b: any) { return this.svc.create(b); }
  @ApiBearerAuth('JWT-auth') @UseGuards(JwtAuthGuard,RolesGuard) @Roles('super-admin','admin','editor') @Put(':id') update(@Param('id') id: string,@Body() b: any) { return this.svc.update(id,b); }
  @ApiBearerAuth('JWT-auth') @UseGuards(JwtAuthGuard,RolesGuard) @Roles('super-admin','admin') @Delete(':id') remove(@Param('id') id: string) { return this.svc.remove(id); }
}
