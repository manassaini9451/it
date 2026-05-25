import { Controller, Get, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, CurrentUser } from '../../common/decorators';

@ApiTags('Users') @ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private svc: UsersService) {}
  @Get() @Roles('super-admin','admin') findAll(@Query('page') page=1, @Query('limit') limit=20, @Query('search') search='') {
    return this.svc.findAll(+page,+limit,search);
  }
  @Get('stats') @Roles('super-admin','admin') getStats() { return this.svc.getStats(); }
  @Get('profile') getProfile(@CurrentUser('sub') id: string) { return this.svc.findById(id); }
  @Get(':id') @Roles('super-admin','admin') findOne(@Param('id') id: string) { return this.svc.findById(id); }
  @Put(':id') @Roles('super-admin','admin') update(@Param('id') id: string, @Body() body: any) { return this.svc.update(id, body); }
  @Put('profile/update') updateProfile(@CurrentUser('sub') id: string, @Body() body: any) { return this.svc.update(id, body); }
  @Delete(':id') @Roles('super-admin') remove(@Param('id') id: string) { return this.svc.remove(id); }
}
