import { Controller, Post, Get, Body, Req, Res, UseGuards, HttpCode, Ip } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto } from './dto/auth.dto';
import { Public, CurrentUser } from '../../common/decorators';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private auth: AuthService) {}

  @Public() @Post('register')
  register(@Body() dto: RegisterDto) { return this.auth.register(dto); }

  @Public() @Post('login') @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Ip() ip: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.login(dto, ip);
    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 3600 * 1000,
    });
    // Return WITHOUT refreshToken so interceptor wraps it in {success, data, timestamp}
    return { user: result.user, accessToken: result.accessToken };
  }

  @Public() @Post('verify-email') @HttpCode(200)
  verifyEmail(@Body() dto: VerifyEmailDto) { return this.auth.verifyEmail(dto.token); }

  @Public() @Post('forgot-password') @HttpCode(200)
  forgotPassword(@Body() dto: ForgotPasswordDto) { return this.auth.forgotPassword(dto); }

  @Public() @Post('reset-password') @HttpCode(200)
  resetPassword(@Body() dto: ResetPasswordDto) { return this.auth.resetPassword(dto); }

  @UseGuards(AuthGuard('jwt-refresh')) @Post('refresh') @HttpCode(200)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req.user as any;
    const token = req.cookies?.refresh_token || (req.headers.authorization?.split(' ')[1] || '');
    const tokens = await this.auth.refresh(user.sub, token);
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 3600 * 1000,
    });
    return { accessToken: tokens.accessToken };
  }

  @UseGuards(JwtAuthGuard) @Post('logout') @HttpCode(200) @ApiBearerAuth('JWT-auth')
  async logout(@CurrentUser('sub') userId: string, @Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh_token');
    return this.auth.logout(userId);
  }

  @UseGuards(JwtAuthGuard) @Get('me') @ApiBearerAuth('JWT-auth')
  getMe(@CurrentUser('sub') userId: string) { return this.auth.getMe(userId); }

  @Public() @Get('google') @UseGuards(AuthGuard('google'))
  googleAuth() {}

  @Public() @Get('google/callback') @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const result = await this.auth.googleLogin(req.user);
    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 3600 * 1000,
    });
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${result.accessToken}`);
  }
}