import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../../database/schemas/user.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService, @InjectModel(User.name) private userModel: Model<User>) {
    super({ jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), ignoreExpiration: false, secretOrKey: config.get('JWT_SECRET') });
  }
  async validate(payload: any) {
    const user = await this.userModel.findById(payload.sub).populate('role');
    if (!user) throw new UnauthorizedException();
    // Always use the live populated role name — never the stale JWT claim
    const roleName = (user as any).role?.name || (user as any).role || payload.role;
    return { sub: payload.sub, email: payload.email, role: roleName, user };
  }
}