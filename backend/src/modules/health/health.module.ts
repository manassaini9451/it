import { Module, Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Public } from '../../common/decorators';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
class HealthController {
  constructor(@InjectConnection() private conn: Connection) {}
  @Public() @Get()
  check() { return { status:'ok', db: this.conn.readyState===1?'connected':'disconnected', uptime: process.uptime(), timestamp: new Date().toISOString() }; }
}

@Module({ controllers: [HealthController] })
export class HealthModule {}
