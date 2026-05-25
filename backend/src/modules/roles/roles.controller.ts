import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Public } from '../../common/decorators';
@ApiTags('Roles') @Controller({ path:'roles', version:'1' })
export class RolesController {
  constructor(private svc: RolesService) {}
  @ApiBearerAuth('JWT-auth') @UseGuards(JwtAuthGuard,RolesGuard) @Roles('super-admin') @Get() findAll() { return this.svc.findAll(); }
  @Public() @Post('seed') seed() { return this.svc.seed(); }
}
