import { Injectable, UnauthorizedException, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../database/schemas/user.schema';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userModel.findOne({ email: dto.email.toLowerCase() });
    if (existing) throw new ConflictException('Email already exists');
    const hash = await bcrypt.hash(dto.password, 12);
    const token = uuidv4();
    await this.userModel.create({
      firstName: dto.firstName, lastName: dto.lastName,
      email: dto.email.toLowerCase(), password: hash,
      emailVerificationToken: token, emailVerified: false, status: 'active',
    });
    return { message: 'Registered successfully. Please verify your email.' };
  }

  async login(dto: LoginDto, ip: string) {
    const user = await this.userModel.findOne({ email: dto.email.toLowerCase() }).select('+password').populate('role');
    if (!user || !user.password) throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    if (user.status === 'suspended') throw new UnauthorizedException('Account suspended');
    user.lastLoginAt = new Date(); user.lastLoginIp = ip; user.loginCount = (user.loginCount||0)+1;
    const tokens = await this.generateTokens(user);
    user.refreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    await user.save();
    return { user: this.sanitize(user), accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
  }

  async verifyEmail(token: string) {
    const user = await this.userModel.findOne({ emailVerificationToken: token });
    if (!user) throw new BadRequestException('Invalid token');
    user.emailVerified = true; user.emailVerificationToken = undefined; user.status = 'active';
    await user.save();
    return { message: 'Email verified successfully' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userModel.findOne({ email: dto.email.toLowerCase() });
    if (!user) return { message: 'If account exists, reset link sent.' };
    const token = uuidv4();
    user.passwordResetToken = await bcrypt.hash(token, 10);
    user.passwordResetExpires = new Date(Date.now() + 3600000);
    await user.save();
    // In production: send email with token
    return { message: 'If account exists, reset link sent.', debug_token: token };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.userModel.findOne({ email: dto.email.toLowerCase(), passwordResetExpires: { $gt: new Date() } });
    if (!user || !user.passwordResetToken) throw new BadRequestException('Invalid or expired token');
    const valid = await bcrypt.compare(dto.token, user.passwordResetToken);
    if (!valid) throw new BadRequestException('Invalid token');
    user.password = await bcrypt.hash(dto.password, 12);
    user.passwordResetToken = undefined; user.passwordResetExpires = undefined;
    await user.save();
    return { message: 'Password reset successfully' };
  }

  async refresh(userId: string, token: string) {
    const user = await this.userModel.findById(userId).select('+refreshToken');
    if (!user?.refreshToken) throw new UnauthorizedException();
    const valid = await bcrypt.compare(token, user.refreshToken);
    if (!valid) throw new UnauthorizedException();
    const tokens = await this.generateTokens(user);
    user.refreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    await user.save();
    return tokens;
  }

  async logout(userId: string) {
    await this.userModel.findByIdAndUpdate(userId, { refreshToken: null });
    return { message: 'Logged out' };
  }

  async getMe(userId: string) {
    const user = await this.userModel.findById(userId).populate('role');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async validateUser(email: string, password: string) {
    const user = await this.userModel.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user?.password) return null;
    const valid = await bcrypt.compare(password, user.password);
    return valid ? user : null;
  }

  async googleLogin(profile: any) {
    let user = await this.userModel.findOne({ email: profile.email.toLowerCase() }).populate('role');
    if (!user) {
      user = await this.userModel.create({ ...profile, email: profile.email.toLowerCase(), provider: 'google', emailVerified: true, status: 'active' });
    }
    const tokens = await this.generateTokens(user);
    user.refreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    await user.save();
    return { user: this.sanitize(user), ...tokens };
  }

  private async generateTokens(user: User) {
    const payload = { sub: user._id, email: user.email, role: (user as any).role?.name || user.role };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { secret: this.config.get('JWT_SECRET'), expiresIn: this.config.get('JWT_EXPIRES_IN','15m') }),
      this.jwtService.signAsync(payload, { secret: this.config.get('JWT_REFRESH_SECRET'), expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN','7d') }),
    ]);
    return { accessToken, refreshToken };
  }

  private sanitize(user: User) {
    const obj = user.toObject() as any;
    delete obj.password; delete obj.refreshToken; delete obj.emailVerificationToken; delete obj.passwordResetToken;
    return obj;
  }
}
