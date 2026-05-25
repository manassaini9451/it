import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BlogService } from './blog.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Public, CurrentUser } from '../../common/decorators';

@ApiTags('Blogs') @Controller({ path: 'blogs', version: '1' })
export class BlogController {
  constructor(private svc: BlogService) {}
  @Public() @Get() findAll(@Query('page') p=1, @Query('limit') l=12, @Query() q: any) { return this.svc.findAll(+p,+l,q); }
  @Public() @Get('featured') getFeatured(@Query('limit') l=6) { return this.svc.getFeatured(+l); }
  @ApiBearerAuth('JWT-auth') @UseGuards(JwtAuthGuard,RolesGuard) @Roles('super-admin','admin','editor')
  @Get('id/:id') findById(@Param('id') id: string) { return this.svc.findById(id); }
  @Public() @Get(':slug') findBySlug(@Param('slug') slug: string) { return this.svc.findBySlug(slug); }
  @ApiBearerAuth('JWT-auth') @UseGuards(JwtAuthGuard,RolesGuard) @Roles('super-admin','admin','editor')
  @Post() create(@Body() body: any, @CurrentUser('sub') userId: string) { return this.svc.create({...body,author:userId}); }
  @ApiBearerAuth('JWT-auth') @UseGuards(JwtAuthGuard,RolesGuard) @Roles('super-admin','admin','editor')
  @Put(':id') update(@Param('id') id: string, @Body() body: any) { return this.svc.update(id,body); }
  @ApiBearerAuth('JWT-auth') @UseGuards(JwtAuthGuard,RolesGuard) @Roles('super-admin','admin')
  @Delete(':id') remove(@Param('id') id: string) { return this.svc.remove(id); }
}