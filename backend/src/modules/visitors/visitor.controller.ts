import { Controller, Get, Delete, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { VisitorService } from './visitor.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators';

@ApiTags('Visitors')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: 'visitors', version: '1' })
export class VisitorController {
  constructor(private svc: VisitorService) {}

  @Get()
  @Roles('super-admin', 'admin')
  getAll(@Query('page') page = '1', @Query('limit') limit = '20') {
    return this.svc.getAll(+page, +limit);
  }

  @Get('active')
  @Roles('super-admin', 'admin')
  getActive(@Query('minutes') minutes = '5') {
    return this.svc.getActive(+minutes);
  }

  @Get('summary')
  @Roles('super-admin', 'admin')
  getSummary() {
    return this.svc.getSummary();
  }

  @Get('export')
  @Roles('super-admin', 'admin')
  async export(
    @Query('from') from: string,
    @Query('to') to: string,
    @Res() res: Response,
  ) {
    const fromDate = from ? new Date(from) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const toDate   = to   ? new Date(to)   : new Date();
    // Set 'to' to end of day
    toDate.setHours(23, 59, 59, 999);

    const csv = await this.svc.exportCSV(fromDate, toDate);

    const label = `visitors_${fromDate.toISOString().slice(0,10)}_to_${toDate.toISOString().slice(0,10)}`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${label}.csv"`);
    res.send(csv);
  }

  @Delete('cleanup')
  @Roles('super-admin')
  cleanup(@Query('days') days = '90') {
    return this.svc.deleteOld(+days);
  }
}