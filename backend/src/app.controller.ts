import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Controller('settings')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('theme')
  getTheme() {
    return this.appService.getTheme();
  }

  @UseGuards(JwtAuthGuard)
  @Post('theme')
  setTheme(@Request() req, @Body() body: { theme: string }) {
    if (req.user.role !== 'ADMIN') {
      throw new UnauthorizedException('Only admins can change the theme');
    }
    return this.appService.setTheme(body.theme);
  }
}
