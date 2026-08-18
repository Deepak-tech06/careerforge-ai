import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async getTheme() {
    let settings = await this.prisma.systemSettings.findUnique({
      where: { id: 'global' },
    });
    if (!settings) {
      settings = await this.prisma.systemSettings.create({
        data: { id: 'global', theme: 'HOSTIM' },
      });
    }
    return { theme: settings.theme };
  }

  async setTheme(theme: string) {
    const settings = await this.prisma.systemSettings.upsert({
      where: { id: 'global' },
      update: { theme },
      create: { id: 'global', theme },
    });
    return { theme: settings.theme };
  }
}
